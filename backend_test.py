#!/usr/bin/env python3
import requests
import json
import sys
from datetime import datetime, timedelta

class RestaurantAPITester:
    def __init__(self, base_url="https://table-manager-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.room_id = None
        self.table_id = None
        self.reservation_id = None
        self.haccp_record_id = None

    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
            
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        self.log("\n=== Testing Authentication Flow ===")
        
        # Test user registration
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@restaurant.com"
        register_data = {
            "name": "Test Admin",
            "email": test_email,
            "password": "TestPassword123!"
        }
        
        success, response = self.run_test(
            "User Registration", "POST", "auth/register", 200, register_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['user_id']
            self.log(f"✅ Got auth token: {self.token[:20]}...")
            
            # Test login with same credentials
            login_data = {
                "email": test_email,
                "password": "TestPassword123!"
            }
            
            success, response = self.run_test(
                "User Login", "POST", "auth/login", 200, login_data
            )
            
            if success:
                # Test get current user
                self.run_test("Get Current User", "GET", "auth/me", 200)
            
            return True
        
        return False

    def test_settings_flow(self):
        """Test settings management"""
        self.log("\n=== Testing Settings Management ===")
        
        # Get settings (should create defaults if none exist)
        success, settings = self.run_test("Get Settings", "GET", "settings", 200)
        
        if success:
            # Update settings
            updated_settings = {
                "open_days": [0, 1, 2, 3, 4, 5],
                "lunch_start": "12:00",
                "lunch_end": "15:30",
                "dinner_start": "19:00",
                "dinner_end": "23:30",
                "avg_table_time": 120,
                "max_capacity_lunch": 60,
                "max_capacity_dinner": 80
            }
            
            self.run_test("Update Settings", "PUT", "settings", 200, updated_settings)
        
        return success

    def test_rooms_flow(self):
        """Test room management"""
        self.log("\n=== Testing Rooms Management ===")
        
        # Create a room
        room_data = {
            "name": "Salão Principal",
            "capacity": 50
        }
        
        success, room = self.run_test("Create Room", "POST", "rooms", 200, room_data)
        
        if success and 'room_id' in room:
            self.room_id = room['room_id']
            
            # Get all rooms
            self.run_test("Get Rooms", "GET", "rooms", 200)
            
            # Update room
            updated_room = {
                "name": "Salão Principal Renovado",
                "capacity": 60
            }
            self.run_test("Update Room", "PUT", f"rooms/{self.room_id}", 200, updated_room)
            
            return True
        
        return False

    def test_tables_flow(self):
        """Test table management"""
        self.log("\n=== Testing Tables Management ===")
        
        if not self.room_id:
            self.log("❌ Room ID required for table tests")
            return False
        
        # Create a table
        table_data = {
            "number": "1",
            "room_id": self.room_id,
            "capacity": 4,
            "can_join": True
        }
        
        success, table = self.run_test("Create Table", "POST", "tables", 200, table_data)
        
        if success and 'table_id' in table:
            self.table_id = table['table_id']
            
            # Get all tables
            self.run_test("Get Tables", "GET", "tables", 200)
            
            # Update table
            updated_table = {
                "number": "1A",
                "room_id": self.room_id,
                "capacity": 6,
                "can_join": False
            }
            self.run_test("Update Table", "PUT", f"tables/{self.table_id}", 200, updated_table)
            
            return True
        
        return False

    def test_reservations_flow(self):
        """Test reservation management"""
        self.log("\n=== Testing Reservations Management ===")
        
        # Create a reservation (public endpoint)
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        reservation_data = {
            "name": "João Silva",
            "phone": "+351912345678",
            "email": "joao@email.com",
            "guests": 4,
            "date": tomorrow,
            "time": "19:30",
            "notes": "Aniversário - mesa junto à janela se possível"
        }
        
        success, reservation = self.run_test(
            "Create Reservation (Public)", "POST", "reservations", 200, reservation_data
        )
        
        if success and 'reservation_id' in reservation:
            self.reservation_id = reservation['reservation_id']
            
            # Get all reservations (admin)
            self.run_test("Get All Reservations", "GET", "reservations", 200)
            
            # Get reservations by date
            self.run_test("Get Reservations by Date", "GET", f"reservations?date={tomorrow}", 200)
            
            # Get reservations by status
            self.run_test("Get Confirmed Reservations", "GET", "reservations?status=confirmed", 200)
            
            # Update reservation
            update_data = {
                "status": "confirmed",
                "notes": "Confirmado - mesa preparada"
            }
            self.run_test("Update Reservation", "PUT", f"reservations/{self.reservation_id}", 200, update_data)
            
            return True
        
        return False

    def test_haccp_flow(self):
        """Test HACCP module"""
        self.log("\n=== Testing HACCP Module ===")
        
        # Create temperature record
        temp_record = {
            "record_type": "temperature",
            "equipment_product": "Frigorífico Principal",
            "value": "4",
            "user_name": "Maria Santos",
            "signature": "data:image/png;base64,iVBORw0KGgoAAAANSU...",
            "notes": "Temperatura conforme"
        }
        
        success, record = self.run_test("Create Temperature Record", "POST", "haccp", 200, temp_record)
        
        if success and 'record_id' in record:
            self.haccp_record_id = record['record_id']
            
            # Create cleaning record
            cleaning_record = {
                "record_type": "cleaning",
                "equipment_product": "Bancada Cozinha",
                "value": "Conforme",
                "user_name": "Pedro Costa",
                "notes": "Limpeza e desinfeção completa"
            }
            self.run_test("Create Cleaning Record", "POST", "haccp", 200, cleaning_record)
            
            # Create goods reception record
            goods_record = {
                "record_type": "goods_reception",
                "equipment_product": "Carne Fresca - Fornecedor XYZ",
                "value": "15 kg",
                "user_name": "Ana Silva",
                "notes": "Temperatura de chegada: 2°C"
            }
            self.run_test("Create Goods Reception Record", "POST", "haccp", 200, goods_record)
            
            # Create expiry record
            expiry_record = {
                "record_type": "expiry",
                "equipment_product": "Leite UHT",
                "value": "2024-12-31",
                "user_name": "Carlos Ferreira"
            }
            self.run_test("Create Expiry Record", "POST", "haccp", 200, expiry_record)
            
            # Get all HACCP records
            self.run_test("Get All HACCP Records", "GET", "haccp", 200)
            
            # Get records by type
            self.run_test("Get Temperature Records", "GET", "haccp?record_type=temperature", 200)
            
            # Get HACCP alerts
            self.run_test("Get HACCP Alerts", "GET", "haccp/alerts", 200)
            
            return True
        
        return False

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        self.log("\n=== Testing Dashboard Stats ===")
        
        success, stats = self.run_test("Get Dashboard Stats", "GET", "dashboard/stats", 200)
        
        if success:
            expected_fields = ['today_reservations', 'occupancy_rate', 'upcoming_reservations', 'haccp_alerts', 'pending_records']
            for field in expected_fields:
                if field not in stats:
                    self.log(f"❌ Missing field in stats: {field}")
                    return False
                else:
                    self.log(f"✅ Stats field present: {field} = {stats[field]}")
        
        return success

    def test_error_handling(self):
        """Test error scenarios"""
        self.log("\n=== Testing Error Handling ===")
        
        # Test invalid endpoints
        self.run_test("Invalid Endpoint", "GET", "invalid/endpoint", 404)
        
        # Test unauthorized access (without token)
        old_token = self.token
        self.token = None
        self.run_test("Unauthorized Access", "GET", "rooms", 401)
        self.token = old_token
        
        # Test invalid reservation data
        invalid_reservation = {
            "name": "",  # Empty name
            "guests": 0,  # Invalid guest count
            "date": "invalid-date"
        }
        self.run_test("Invalid Reservation Data", "POST", "reservations", 400, invalid_reservation)

    def cleanup(self):
        """Clean up test data"""
        self.log("\n=== Cleaning Up Test Data ===")
        
        if self.reservation_id:
            self.run_test("Cancel Reservation", "DELETE", f"reservations/{self.reservation_id}", 200)
        
        if self.table_id:
            self.run_test("Delete Table", "DELETE", f"tables/{self.table_id}", 200)
        
        if self.room_id:
            self.run_test("Delete Room", "DELETE", f"rooms/{self.room_id}", 200)

    def run_all_tests(self):
        """Run complete test suite"""
        self.log("🚀 Starting Restaurant Management System API Tests")
        self.log(f"Base URL: {self.base_url}")
        
        try:
            # Test authentication first
            if not self.test_auth_flow():
                self.log("❌ Authentication failed - stopping tests")
                return False
            
            # Test all modules
            self.test_settings_flow()
            self.test_rooms_flow()
            self.test_tables_flow()
            self.test_reservations_flow()
            self.test_haccp_flow()
            self.test_dashboard_stats()
            self.test_error_handling()
            
            # Cleanup
            self.cleanup()
            
            # Print final results
            success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
            
            self.log(f"\n📊 Test Results:")
            self.log(f"   Tests Run: {self.tests_run}")
            self.log(f"   Tests Passed: {self.tests_passed}")
            self.log(f"   Success Rate: {success_rate:.1f}%")
            
            if success_rate >= 90:
                self.log("✅ Backend API tests PASSED")
                return True
            else:
                self.log("❌ Backend API tests FAILED")
                return False
                
        except Exception as e:
            self.log(f"❌ Test suite failed with error: {str(e)}")
            return False

def main():
    tester = RestaurantAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())