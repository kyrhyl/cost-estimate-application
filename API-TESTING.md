# API Testing Guide

This guide provides examples for testing all API endpoints using tools like Postman, Insomnia, Thunder Client, or curl.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently no authentication is implemented. All endpoints are open.

---

## Rate Items (UPA) Endpoints

### 1. Create Rate Item

**POST** `/api/rates`

**Request Body:**
```json
{
  "payItemNumber": "801 (1)",
  "payItemDescription": "Removal of Structures and Obstruction",
  "unitOfMeasurement": "l.s.",
  "outputPerHourSubmitted": 1.0,
  "outputPerHourEvaluated": 1.0,
  "laborSubmitted": [
    {
      "designation": "Foreman",
      "noOfPersons": 1.0,
      "noOfHours": 96.0,
      "hourlyRate": 220.85,
      "amount": 21201.6
    },
    {
      "designation": "Unskilled Labor",
      "noOfPersons": 5.0,
      "noOfHours": 96.0,
      "hourlyRate": 72.85,
      "amount": 34968.0
    }
  ],
  "laborEvaluated": [],
  "equipmentSubmitted": [
    {
      "nameAndCapacity": "Minor Tools (10% of Labor Cost)",
      "noOfUnits": 1.0,
      "noOfHours": 0,
      "hourlyRate": 0,
      "amount": 0
    }
  ],
  "equipmentEvaluated": [],
  "materialSubmitted": [],
  "materialEvaluated": [],
  "addOnPercentages": {
    "ocmSubmitted": 0,
    "ocmEvaluated": 15,
    "cpSubmitted": 10,
    "cpEvaluated": 0,
    "vatSubmitted": 12,
    "vatEvaluated": 0
  }
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "payItemNumber": "801 (1)",
    "payItemDescription": "Removal of Structures and Obstruction",
    // ... full rate item
    "createdAt": "2025-12-15T10:30:00.000Z",
    "updatedAt": "2025-12-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/rates \
  -H "Content-Type: application/json" \
  -d @rate-item.json
```

---

### 2. List All Rate Items

**GET** `/api/rates`

**Query Parameters:**
- `search` (optional) - Search by pay item number or description

**Examples:**
```
GET /api/rates
GET /api/rates?search=removal
GET /api/rates?search=801
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "payItemNumber": "801 (1)",
      "payItemDescription": "Removal of Structures and Obstruction",
      "unitOfMeasurement": "l.s.",
      "outputPerHourSubmitted": 1.0,
      "createdAt": "2025-12-15T10:30:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/rates
curl "http://localhost:3000/api/rates?search=removal"
```

---

### 3. Get Specific Rate Item

**GET** `/api/rates/:id`

**Example:**
```
GET /api/rates/507f1f77bcf86cd799439011
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "payItemNumber": "801 (1)",
    "payItemDescription": "Removal of Structures and Obstruction",
    "laborSubmitted": [...],
    // ... complete rate item details
  }
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/rates/507f1f77bcf86cd799439011
```

---

### 4. Update Rate Item

**PUT** `/api/rates/:id`

**Request Body:** (same structure as create, with fields to update)

**Example:**
```json
{
  "payItemDescription": "Updated description",
  "outputPerHourSubmitted": 1.5
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    // ... updated rate item
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:3000/api/rates/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"payItemDescription": "Updated description"}'
```

---

### 5. Delete Rate Item

**DELETE** `/api/rates/:id`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Rate item deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/rates/507f1f77bcf86cd799439011
```

---

## Estimate Endpoints

### 6. Import BOQ and Create Estimate

**POST** `/api/estimates/import`

**Request Body:**
```json
{
  "projectName": "Construction/Completion of Multi-Purpose Building, Purok 1, Barangay Violeta, City of Malaybalay, Bukidnon",
  "projectLocation": "Brgy. Violeta, Malaybalay City, Bukidnon",
  "implementingOffice": "DPWH Bukidnon 1st District Engineering Office",
  "boqLines": [
    {
      "itemNo": "1.01",
      "description": "Removal of Structures and Obstruction",
      "unit": "l.s.",
      "quantity": 1.0,
      "payItemNumber": "801 (1)"
    },
    {
      "itemNo": "2.01",
      "description": "General Excavation",
      "unit": "cu.m",
      "quantity": 150.5,
      "payItemNumber": "802 (1)"
    },
    {
      "itemNo": "3.01",
      "description": "Item without rate item",
      "unit": "cu.m",
      "quantity": 50.0
    }
  ],
  "useEvaluated": false
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "projectName": "Construction/Completion of Multi-Purpose Building...",
    "boqLines": [
      {
        "itemNo": "1.01",
        "description": "Removal of Structures and Obstruction",
        "unit": "l.s.",
        "quantity": 1.0,
        "payItemNumber": "801 (1)",
        "rateItemId": "507f1f77bcf86cd799439011",
        "unitRate": 72823.03,
        "totalAmount": 72823.03,
        "breakdown": {
          "directCostSubmitted": 52016.45,
          "ocmSubmitted": 7802.47,
          "cpSubmitted": 5201.64,
          "vatSubmitted": 7802.47,
          "totalSubmitted": 72823.03
        }
      }
    ],
    "grandTotalSubmitted": 72823.03,
    "createdAt": "2025-12-15T11:00:00.000Z"
  },
  "summary": {
    "totalLines": 3,
    "linesWithPricing": 1,
    "linesWithoutPricing": 2
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/estimates/import \
  -H "Content-Type: application/json" \
  -d @boq-data.json
```

---

### 7. List All Estimates

**GET** `/api/estimates`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "projectName": "Construction/Completion of Multi-Purpose Building...",
      "projectLocation": "Brgy. Violeta, Malaybalay City, Bukidnon",
      "implementingOffice": "DPWH Bukidnon 1st District Engineering Office",
      "grandTotalSubmitted": 72823.03,
      "grandTotalEvaluated": 0,
      "createdAt": "2025-12-15T11:00:00.000Z"
    }
  ]
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/estimates
```

---

### 8. Get Specific Estimate

**GET** `/api/estimates/:id`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "projectName": "Construction/Completion of Multi-Purpose Building...",
    "boqLines": [...],
    "grandTotalSubmitted": 72823.03,
    // ... complete estimate details
  }
}
```

**cURL Example:**
```bash
curl http://localhost:3000/api/estimates/507f1f77bcf86cd799439012
```

---

### 9. Delete Estimate

**DELETE** `/api/estimates/:id`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Estimate deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/estimates/507f1f77bcf86cd799439012
```

---

## Error Responses

All endpoints follow this error format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid input data"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Rate item not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Database connection error"
}
```

---

## Testing Workflow

### Complete Test Sequence

1. **Create Rate Item 1:**
   ```bash
   POST /api/rates
   [Use sample from section 1]
   Save returned _id
   ```

2. **Create Rate Item 2:**
   ```bash
   POST /api/rates
   [Use different pay item number]
   ```

3. **List Rate Items:**
   ```bash
   GET /api/rates
   Verify both items appear
   ```

4. **Search Rate Items:**
   ```bash
   GET /api/rates?search=removal
   Verify search works
   ```

5. **Create Estimate:**
   ```bash
   POST /api/estimates/import
   [Use BOQ referencing created rate items]
   Save returned estimate _id
   ```

6. **Get Estimate Details:**
   ```bash
   GET /api/estimates/:id
   Verify calculations match expected values
   ```

7. **Update Rate Item:**
   ```bash
   PUT /api/rates/:id
   [Change a value]
   ```

8. **Delete Estimate:**
   ```bash
   DELETE /api/estimates/:id
   ```

9. **Delete Rate Items:**
   ```bash
   DELETE /api/rates/:id
   ```

---

## PowerShell Testing Examples

### Using Invoke-RestMethod

**Create Rate Item:**
```powershell
$body = Get-Content rate-item.json -Raw
$headers = @{"Content-Type" = "application/json"}
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/rates" -Method Post -Body $body -Headers $headers
$response | ConvertTo-Json -Depth 10
```

**Get Rate Items:**
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/rates"
$response.data | Format-Table payItemNumber, payItemDescription
```

**Create Estimate:**
```powershell
$boq = Get-Content boq-data.json -Raw
$headers = @{"Content-Type" = "application/json"}
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/estimates/import" -Method Post -Body $boq -Headers $headers
Write-Host "Grand Total: $($response.data.grandTotalSubmitted)"
```

---

## VS Code REST Client

Install "REST Client" extension and create `api-tests.http`:

```http
### Create Rate Item
POST http://localhost:3000/api/rates
Content-Type: application/json

{
  "payItemNumber": "801 (1)",
  "payItemDescription": "Removal of Structures and Obstruction",
  "unitOfMeasurement": "l.s.",
  "outputPerHourSubmitted": 1.0,
  "laborSubmitted": [],
  "addOnPercentages": {
    "ocmEvaluated": 15,
    "cpSubmitted": 10,
    "vatSubmitted": 12
  }
}

### Get All Rate Items
GET http://localhost:3000/api/rates

### Create Estimate
POST http://localhost:3000/api/estimates/import
Content-Type: application/json

{
  "projectName": "Test Project",
  "projectLocation": "Test Location",
  "implementingOffice": "Test Office",
  "boqLines": [
    {
      "itemNo": "1.01",
      "description": "Test Item",
      "unit": "l.s.",
      "quantity": 1.0,
      "payItemNumber": "801 (1)"
    }
  ]
}
```

Click "Send Request" above each `###` section.

---

## Validation Checklist

- [ ] Can create rate item successfully
- [ ] Can retrieve rate items
- [ ] Search functionality works
- [ ] Can update rate item
- [ ] Can delete rate item
- [ ] Can import BOQ and create estimate
- [ ] Pricing calculations are correct
- [ ] Line items with rate items are priced
- [ ] Line items without rate items are included but not priced
- [ ] Can retrieve estimate details
- [ ] Summary totals are accurate
- [ ] Can delete estimate

---

**Note:** Replace MongoDB ObjectIds in examples with actual IDs from your responses.
