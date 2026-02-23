from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import resend
import asyncio
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend setup
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# JWT setup
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Enums
class ReservationStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"

class MealType(str, Enum):
    lunch = "almoco"
    dinner = "jantar"

class HACCPType(str, Enum):
    temperature = "temperature"
    cleaning = "cleaning"
    goods_reception = "goods_reception"
    expiry = "expiry"

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    role: str = "admin"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Room(BaseModel):
    model_config = ConfigDict(extra="ignore")
    room_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    capacity: int

class RoomCreate(BaseModel):
    name: str
    capacity: int

class Table(BaseModel):
    model_config = ConfigDict(extra="ignore")
    table_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: str
    room_id: str
    capacity: int
    can_join: bool = False

class TableCreate(BaseModel):
    number: str
    room_id: str
    capacity: int
    can_join: bool = False

class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    settings_id: str = "global"
    open_days: List[int]
    lunch_start: str
    lunch_end: str
    dinner_start: str
    dinner_end: str
    avg_table_time: int
    max_capacity_lunch: int
    max_capacity_dinner: int

class SettingsUpdate(BaseModel):
    open_days: List[int]
    lunch_start: str
    lunch_end: str
    dinner_start: str
    dinner_end: str
    avg_table_time: int
    max_capacity_lunch: int
    max_capacity_dinner: int

class Reservation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    reservation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[EmailStr] = None
    guests: int
    date: str
    time: str
    meal_type: MealType
    table_id: Optional[str] = None
    status: ReservationStatus = ReservationStatus.pending
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReservationCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    guests: int
    date: str
    time: str
    notes: Optional[str] = None

class ReservationUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    guests: Optional[int] = None
    date: Optional[str] = None
    time: Optional[str] = None
    table_id: Optional[str] = None
    status: Optional[ReservationStatus] = None
    notes: Optional[str] = None

class HACCPRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    record_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    record_type: HACCPType
    equipment_product: str
    value: Optional[str] = None
    photo_url: Optional[str] = None
    user_name: str
    signature: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HACCPRecordCreate(BaseModel):
    record_type: HACCPType
    equipment_product: str
    value: Optional[str] = None
    photo_url: Optional[str] = None
    user_name: str
    signature: Optional[str] = None
    notes: Optional[str] = None

class Equipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    equipment_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str
    location: Optional[str] = None

class EquipmentCreate(BaseModel):
    name: str
    type: str
    location: Optional[str] = None

class Space(BaseModel):
    model_config = ConfigDict(extra="ignore")
    space_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str

class SpaceCreate(BaseModel):
    name: str
    type: str

class DashboardStats(BaseModel):
    today_reservations: int
    occupancy_rate: float
    upcoming_reservations: List[Reservation]
    haccp_alerts: int
    pending_records: int

# Auth functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        user = await db.users.find_one({'user_id': user_id}, {'_id': 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Email functions
async def send_email(to: str, subject: str, html: str):
    if not resend.api_key or resend.api_key == '':
        logger.warning("Resend API key not configured, skipping email")
        return None
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html
        }
        email = await asyncio.to_thread(resend.Emails.send, params)
        return email
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return None

# Auth routes
@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing = await db.users.find_one({'email': user_data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        'user_id': str(uuid.uuid4()),
        'name': user_data.name,
        'email': user_data.email,
        'password': hash_password(user_data.password),
        'role': 'admin',
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_dict)
    token = create_token(user_dict['user_id'])
    
    return {
        'token': token,
        'user': {
            'user_id': user_dict['user_id'],
            'name': user_dict['name'],
            'email': user_dict['email'],
            'role': user_dict['role']
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({'email': credentials.email}, {'_id': 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['user_id'])
    return {
        'token': token,
        'user': {
            'user_id': user['user_id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        'user_id': current_user['user_id'],
        'name': current_user['name'],
        'email': current_user['email'],
        'role': current_user['role']
    }

# Rooms routes
@api_router.get("/rooms", response_model=List[Room])
async def get_rooms(current_user: dict = Depends(get_current_user)):
    rooms = await db.rooms.find({}, {'_id': 0}).to_list(1000)
    return rooms

@api_router.post("/rooms", response_model=Room)
async def create_room(room_data: RoomCreate, current_user: dict = Depends(get_current_user)):
    room = Room(**room_data.model_dump())
    await db.rooms.insert_one(room.model_dump())
    return room

@api_router.put("/rooms/{room_id}", response_model=Room)
async def update_room(room_id: str, room_data: RoomCreate, current_user: dict = Depends(get_current_user)):
    result = await db.rooms.update_one(
        {'room_id': room_id},
        {'$set': room_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    
    updated_room = await db.rooms.find_one({'room_id': room_id}, {'_id': 0})
    return updated_room

@api_router.delete("/rooms/{room_id}")
async def delete_room(room_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.rooms.delete_one({'room_id': room_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {'message': 'Room deleted successfully'}

# Tables routes
@api_router.get("/tables", response_model=List[Table])
async def get_tables(current_user: dict = Depends(get_current_user)):
    tables = await db.tables.find({}, {'_id': 0}).to_list(1000)
    return tables

@api_router.post("/tables", response_model=Table)
async def create_table(table_data: TableCreate, current_user: dict = Depends(get_current_user)):
    table = Table(**table_data.model_dump())
    await db.tables.insert_one(table.model_dump())
    return table

@api_router.put("/tables/{table_id}", response_model=Table)
async def update_table(table_id: str, table_data: TableCreate, current_user: dict = Depends(get_current_user)):
    result = await db.tables.update_one(
        {'table_id': table_id},
        {'$set': table_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Table not found")
    
    updated_table = await db.tables.find_one({'table_id': table_id}, {'_id': 0})
    return updated_table

@api_router.delete("/tables/{table_id}")
async def delete_table(table_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.tables.delete_one({'table_id': table_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Table not found")
    return {'message': 'Table deleted successfully'}

# Settings routes
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    settings = await db.settings.find_one({'settings_id': 'global'}, {'_id': 0})
    if not settings:
        default_settings = Settings(
            open_days=[1, 2, 3, 4, 5, 6],
            lunch_start="12:00",
            lunch_end="15:00",
            dinner_start="19:00",
            dinner_end="23:00",
            avg_table_time=90,
            max_capacity_lunch=50,
            max_capacity_dinner=60
        )
        await db.settings.insert_one(default_settings.model_dump())
        return default_settings
    return settings

@api_router.put("/settings", response_model=Settings)
async def update_settings(settings_data: SettingsUpdate, current_user: dict = Depends(get_current_user)):
    settings_dict = settings_data.model_dump()
    settings_dict['settings_id'] = 'global'
    
    await db.settings.update_one(
        {'settings_id': 'global'},
        {'$set': settings_dict},
        upsert=True
    )
    
    updated = await db.settings.find_one({'settings_id': 'global'}, {'_id': 0})
    return updated

# Reservations routes
@api_router.get("/reservations", response_model=List[Reservation])
async def get_reservations(
    date: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if date:
        query['date'] = date
    if status:
        query['status'] = status
    
    reservations = await db.reservations.find(query, {'_id': 0}).to_list(1000)
    return reservations

@api_router.post("/reservations", response_model=Reservation)
async def create_reservation(reservation_data: ReservationCreate):
    # Get settings
    settings = await db.settings.find_one({'settings_id': 'global'}, {'_id': 0})
    if not settings:
        raise HTTPException(status_code=400, detail="Settings not configured")
    
    # Validate date and time
    try:
        reservation_date = datetime.strptime(reservation_data.date, "%Y-%m-%d")
        day_of_week = reservation_date.weekday()
        
        # Check if day is open (Monday=0, Sunday=6)
        if day_of_week not in settings['open_days']:
            raise HTTPException(status_code=400, detail="Restaurant closed on this day")
        
        # Determine meal type
        time_obj = datetime.strptime(reservation_data.time, "%H:%M").time()
        lunch_start = datetime.strptime(settings['lunch_start'], "%H:%M").time()
        lunch_end = datetime.strptime(settings['lunch_end'], "%H:%M").time()
        dinner_start = datetime.strptime(settings['dinner_start'], "%H:%M").time()
        dinner_end = datetime.strptime(settings['dinner_end'], "%H:%M").time()
        
        if lunch_start <= time_obj <= lunch_end:
            meal_type = MealType.lunch
            max_capacity = settings['max_capacity_lunch']
        elif dinner_start <= time_obj <= dinner_end:
            meal_type = MealType.dinner
            max_capacity = settings['max_capacity_dinner']
        else:
            raise HTTPException(status_code=400, detail="Time not available for reservations")
        
        # Check capacity
        existing_reservations = await db.reservations.find({
            'date': reservation_data.date,
            'meal_type': meal_type,
            'status': {'$ne': 'cancelled'}
        }, {'_id': 0}).to_list(1000)
        
        total_guests = sum(r.get('guests', 0) for r in existing_reservations)
        if total_guests + reservation_data.guests > max_capacity:
            raise HTTPException(status_code=400, detail="No capacity available for this time")
        
        # Find available table
        tables = await db.tables.find({}, {'_id': 0}).to_list(1000)
        available_table = None
        
        # Get tables already reserved for this time
        reserved_table_ids = [r.get('table_id') for r in existing_reservations if r.get('table_id')]
        
        # Find suitable table
        for table in tables:
            if table['table_id'] not in reserved_table_ids and table['capacity'] >= reservation_data.guests:
                available_table = table['table_id']
                break
        
        # Create reservation
        reservation = Reservation(
            **reservation_data.model_dump(),
            meal_type=meal_type,
            table_id=available_table,
            status=ReservationStatus.confirmed
        )
        
        await db.reservations.insert_one(reservation.model_dump())
        
        # Send confirmation email
        if reservation_data.email and resend.api_key:
            html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Reserva Confirmada</h2>
                <p>Olá {reservation_data.name},</p>
                <p>A sua reserva foi confirmada com sucesso!</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Data:</strong> {reservation_data.date}</p>
                    <p><strong>Hora:</strong> {reservation_data.time}</p>
                    <p><strong>Pessoas:</strong> {reservation_data.guests}</p>
                    {f'<p><strong>Mesa:</strong> {available_table}</p>' if available_table else ''}
                </div>
                <p>Aguardamos por si!</p>
            </div>
            """
            await send_email(reservation_data.email, "Reserva Confirmada", html)
        
        return reservation
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date or time format: {str(e)}")

@api_router.put("/reservations/{reservation_id}", response_model=Reservation)
async def update_reservation(
    reservation_id: str,
    reservation_data: ReservationUpdate,
    current_user: dict = Depends(get_current_user)
):
    update_dict = {k: v for k, v in reservation_data.model_dump().items() if v is not None}
    
    result = await db.reservations.update_one(
        {'reservation_id': reservation_id},
        {'$set': update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    updated = await db.reservations.find_one({'reservation_id': reservation_id}, {'_id': 0})
    return updated

@api_router.delete("/reservations/{reservation_id}")
async def cancel_reservation(reservation_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.reservations.update_one(
        {'reservation_id': reservation_id},
        {'$set': {'status': ReservationStatus.cancelled}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    return {'message': 'Reservation cancelled successfully'}

# Equipment routes
@api_router.get("/equipment", response_model=List[Equipment])
async def get_equipment(current_user: dict = Depends(get_current_user)):
    equipment = await db.equipment.find({}, {'_id': 0}).to_list(1000)
    return equipment

@api_router.post("/equipment", response_model=Equipment)
async def create_equipment(equipment_data: EquipmentCreate, current_user: dict = Depends(get_current_user)):
    equipment = Equipment(**equipment_data.model_dump())
    await db.equipment.insert_one(equipment.model_dump())
    return equipment

@api_router.delete("/equipment/{equipment_id}")
async def delete_equipment(equipment_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.equipment.delete_one({'equipment_id': equipment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return {'message': 'Equipment deleted successfully'}

# Space routes
@api_router.get("/spaces", response_model=List[Space])
async def get_spaces(current_user: dict = Depends(get_current_user)):
    spaces = await db.spaces.find({}, {'_id': 0}).to_list(1000)
    return spaces

@api_router.post("/spaces", response_model=Space)
async def create_space(space_data: SpaceCreate, current_user: dict = Depends(get_current_user)):
    space = Space(**space_data.model_dump())
    await db.spaces.insert_one(space.model_dump())
    return space

@api_router.delete("/spaces/{space_id}")
async def delete_space(space_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.spaces.delete_one({'space_id': space_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Space not found")
    return {'message': 'Space deleted successfully'}

# HACCP routes
@api_router.get("/haccp", response_model=List[HACCPRecord])
async def get_haccp_records(
    record_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if record_type:
        query['record_type'] = record_type
    
    records = await db.haccp_records.find(query, {'_id': 0}).sort('created_at', -1).to_list(1000)
    return records

@api_router.post("/haccp", response_model=HACCPRecord)
async def create_haccp_record(record_data: HACCPRecordCreate, current_user: dict = Depends(get_current_user)):
    record = HACCPRecord(**record_data.model_dump())
    await db.haccp_records.insert_one(record.model_dump())
    return record

@api_router.get("/haccp/alerts")
async def get_haccp_alerts(current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date()
    today_str = today.isoformat()
    
    # Check if temperature records exist for today
    temp_records = await db.haccp_records.find({
        'record_type': 'temperature',
        'created_at': {'$gte': today_str}
    }, {'_id': 0}).to_list(1000)
    
    # Check if cleaning records exist for today
    cleaning_records = await db.haccp_records.find({
        'record_type': 'cleaning',
        'created_at': {'$gte': today_str}
    }, {'_id': 0}).to_list(1000)
    
    alerts = []
    if len(temp_records) < 3:
        alerts.append({
            'type': 'warning',
            'message': 'Faltam registos de temperatura hoje',
            'priority': 'high'
        })
    
    if len(cleaning_records) < 2:
        alerts.append({
            'type': 'warning',
            'message': 'Faltam registos de limpeza hoje',
            'priority': 'medium'
        })
    
    # Send email alert if there are critical alerts
    if alerts and current_user.get('email'):
        critical_alerts = [a for a in alerts if a['priority'] == 'high']
        if critical_alerts and resend.api_key:
            html = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f43f5e;">Alerta HACCP</h2>
                <p>Existem registos HACCP pendentes:</p>
                <ul>
                {''.join([f'<li>{a["message"]}</li>' for a in alerts])}
                </ul>
                <p>Por favor, complete os registos em falta.</p>
            </div>
            """
            await send_email(current_user['email'], "Alerta HACCP - Registos Pendentes", html)
    
    return {'alerts': alerts}

# Dashboard routes
@api_router.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).date().isoformat()
    
    # Today's reservations
    today_reservations = await db.reservations.count_documents({
        'date': today,
        'status': {'$ne': 'cancelled'}
    })
    
    # Occupancy rate
    settings = await db.settings.find_one({'settings_id': 'global'}, {'_id': 0})
    total_capacity = (settings.get('max_capacity_lunch', 50) + settings.get('max_capacity_dinner', 60)) if settings else 110
    
    today_guests = await db.reservations.find({
        'date': today,
        'status': {'$ne': 'cancelled'}
    }, {'_id': 0}).to_list(1000)
    
    total_guests = sum(r.get('guests', 0) for r in today_guests)
    occupancy_rate = (total_guests / total_capacity * 100) if total_capacity > 0 else 0
    
    # Upcoming reservations
    upcoming = await db.reservations.find({
        'date': {'$gte': today},
        'status': {'$ne': 'cancelled'}
    }, {'_id': 0}).sort('date', 1).to_list(5)
    
    # HACCP alerts
    haccp_today = await db.haccp_records.count_documents({
        'created_at': {'$gte': today}
    })
    
    haccp_alerts = 0
    if haccp_today < 5:
        haccp_alerts = 5 - haccp_today
    
    return {
        'today_reservations': today_reservations,
        'occupancy_rate': round(occupancy_rate, 1),
        'upcoming_reservations': upcoming,
        'haccp_alerts': haccp_alerts,
        'pending_records': haccp_alerts
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
