# Setup & Installation Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Git (optional)

## Step-by-Step Setup

### 1. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Mongoose (MongoDB ODM)
- Tailwind CSS
- And other dependencies

### 2. Setup MongoDB

#### Option A: Local MongoDB

1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```
3. MongoDB will run on `mongodb://localhost:27017`

#### Option B: MongoDB Atlas (Cloud)

1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create database user with password
4. Whitelist your IP address (or use 0.0.0.0/0 for testing)
5. Get connection string from "Connect" → "Connect your application"

### 3. Configure Environment Variables

Edit `.env.local` file:

```env
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/upa-estimating

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/upa-estimating?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with your actual credentials.

### 4. Run Development Server

```powershell
npm run dev
```

The application will be available at: **http://localhost:3000**

### 5. Verify Installation

Open your browser to `http://localhost:3000`

You should see the home page with:
- Navigation menu (Home, Rate Items, New Estimate)
- Welcome message
- Two cards: "Rate Items (UPA)" and "Create Estimate"

## Testing the Application

### Test 1: Create a Rate Item

1. Click "Manage Rate Items" or navigate to `/rates`
2. Click "+ New Rate Item"
3. Fill in the form:
   - **Pay Item Number**: `801 (1)`
   - **Pay Item Description**: `Removal of Structures and Obstruction`
   - **Unit of Measurement**: `l.s.`
   - **Output per Hour**: `1.00`
   
4. Add Labor entries:
   - Foreman: 1 person × 96 hours @ ₱220.85/hr
   - Unskilled Labor: 5 persons × 96 hours @ ₱72.85/hr
   
5. Equipment should have:
   - Minor Tools (10% of Labor Cost): 1 unit × 0 hours @ ₱0/hr
   
6. Add-on Percentages:
   - OCM Evaluated: 15%
   - CP Submitted: 10%
   - VAT Submitted: 12%

7. Click "Save Rate Item"

### Test 2: Create an Estimate

1. Navigate to `/estimate/new`
2. Click "Load Sample" to load sample JSON
3. Click "Create Estimate"
4. View the detailed breakdown with costs

### Test 3: Verify Calculations

The sample from the screenshot should produce:
- Labor Cost: ₱47,287.68
- Equipment Cost: ₱4,728.77
- Direct Cost: ₱52,016.45
- OCM (15%): ₱7,802.47
- CP (10%): ₱5,201.64
- VAT (12%): ₱7,802.47
- **Total Unit Cost: ₱72,823.03**

## Common Issues & Troubleshooting

### Issue 1: "Cannot connect to MongoDB"

**Solution:**
- Verify MongoDB is running: `mongo --version` or check MongoDB Compass
- Check `.env.local` has correct connection string
- For Atlas: Verify IP whitelist and credentials

### Issue 2: "Module not found" errors

**Solution:**
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Issue 3: Port 3000 already in use

**Solution:**
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or run on different port
$env:PORT=3001; npm run dev
```

### Issue 4: TypeScript errors

**Solution:**
```powershell
npm run build
```
This will show any TypeScript compilation errors.

### Issue 5: Styles not loading

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Delete `.next` folder
3. Restart: `npm run dev`

## Production Build

To create a production build:

```powershell
npm run build
npm start
```

The optimized app will run on port 3000.

## Database Management

### View Data with MongoDB Compass

1. Install MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Connect using your connection string
3. Navigate to `upa-estimating` database
4. View collections: `rateitems`, `estimates`

### Reset Database

To clear all data:

```javascript
// In MongoDB shell or Compass
use upa-estimating
db.rateitems.deleteMany({})
db.estimates.deleteMany({})
```

## Seeding Sample Data

Use the sample data from `sample-data.ts`:

1. **Via Postman/Insomnia/Thunder Client:**

   Create Rate Item:
   ```
   POST http://localhost:3000/api/rates
   Content-Type: application/json
   
   [Copy sampleRateItem from sample-data.ts]
   ```

   Create Estimate:
   ```
   POST http://localhost:3000/api/estimates/import
   Content-Type: application/json
   
   [Copy sampleBOQ from sample-data.ts]
   ```

2. **Via UI:**
   - Use the web forms at `/rates/new` and `/estimate/new`

## Development Tips

### Hot Reload
- Changes to `.ts`, `.tsx` files auto-reload
- Changes to `.env.local` require server restart

### Debug Mode
Add to `.env.local`:
```env
NODE_ENV=development
```

### API Testing
- Use browser DevTools → Network tab
- Or install Thunder Client VS Code extension
- Or use Postman

### Code Formatting
```powershell
npm run lint
```

## Next Steps

1. ✅ Create your first rate item
2. ✅ Import a BOQ and generate estimate
3. ✅ Review the cost breakdowns
4. 📝 Customize add-on percentages as needed
5. 📝 Add more rate items for your projects
6. 📝 Export estimates to PDF (using browser print)

## Support

For issues or questions:
- Check the README.md
- Review the code comments in `/src/lib/pricing-engine.ts`
- Verify against the UPA screenshot

## Project Structure Reference

```
POW/
├── src/
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── rates/          # UPA pages
│   │   ├── estimate/       # BOQ pages
│   │   └── layout.tsx      # Root layout with navigation
│   ├── models/             # MongoDB schemas
│   └── lib/                # Utilities & pricing engine
├── .env.local             # Environment variables (create this!)
├── package.json           # Dependencies
└── README.md              # Documentation
```

## Success Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` configured
- [ ] Dev server running (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Created first rate item
- [ ] Generated first estimate
- [ ] Calculations match screenshot

---

**You're ready to start estimating!** 🎉
