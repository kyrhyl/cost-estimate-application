# 🚀 Quick Start Checklist

Follow these steps to get your UPA Estimating app running in minutes.

## Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB installed locally OR Atlas account ready
- [ ] Code editor (VS Code recommended)
- [ ] PowerShell or terminal access

---

## Installation (5 minutes)

### Step 1: Install Dependencies
```powershell
cd c:\Users\USER\Desktop\APPDEV\POW
npm install
```
⏱️ Wait 1-2 minutes for installation to complete.

### Step 2: Start MongoDB (if using local)
```powershell
# Option A: Start MongoDB service
net start MongoDB

# Option B: Already running? Check with:
mongo --version
```

### Step 3: Configure Environment
Edit `.env.local`:
```env
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/upa-estimating

# For Atlas, use your connection string:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/upa-estimating
```

### Step 4: Start Development Server
```powershell
npm run dev
```
✅ You should see: `Ready on http://localhost:3000`

### Step 5: Open Browser
Navigate to: **http://localhost:3000**

---

## First-Time Setup (10 minutes)

### ✅ Test 1: Create Your First Rate Item

1. Click "**Manage Rate Items**" (or go to `/rates`)
2. Click "**+ New Rate Item**"
3. Fill in the form using this data:

   **Header:**
   - Pay Item Number: `801 (1)`
   - Description: `Removal of Structures and Obstruction`
   - Unit: `l.s.`
   - Output/Hour: `1.00`

   **Labor Section:**
   | Designation | Persons | Hours | Rate |
   |-------------|---------|-------|------|
   | Foreman | 1 | 96 | 220.85 |
   | Unskilled Labor | 5 | 96 | 72.85 |

   **Equipment Section:**
   | Name | Units | Hours | Rate |
   |------|-------|-------|------|
   | Minor Tools (10% of Labor Cost) | 1 | 0 | 0 |

   **Add-on Percentages:**
   - OCM Evaluated: `15`
   - CP Submitted: `10`
   - VAT Submitted: `12`

4. Click "**Save Rate Item**"
5. ✅ You should be redirected to the rates list

### ✅ Test 2: Create Your First Estimate

1. Click "**New Estimate**" (or go to `/estimate/new`)
2. Click "**Load Sample**" button
3. Review the pre-filled JSON data
4. Click "**Create Estimate**"
5. ✅ You should see the estimate results page

### ✅ Test 3: Verify Calculations

On the estimate results page, check:
- [ ] BOQ table shows your items
- [ ] Grand Total displays at top-right
- [ ] Cost Summary table shows breakdown
- [ ] Detailed line items show calculations
- [ ] Total Unit Cost = **₱72,823.03** (if using sample data)

---

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Fix:**
```powershell
# Check if MongoDB is running
mongo --version

# Start MongoDB service
net start MongoDB

# Or check .env.local has correct connection string
```

### Issue: "Port 3000 already in use"
**Fix:**
```powershell
# Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or use different port
$env:PORT=3001; npm run dev
```

### Issue: "Module not found" errors
**Fix:**
```powershell
# Clean install
rm -r node_modules
rm package-lock.json
npm install
```

### Issue: Blank page or styles not loading
**Fix:**
```powershell
# Stop server (Ctrl+C)
rm -r .next
npm run dev
```

---

## Success Indicators

You'll know everything is working when:
- ✅ Home page loads with navigation
- ✅ Can create a rate item
- ✅ Rate item appears in the list
- ✅ Can import BOQ and create estimate
- ✅ Estimate shows correct calculations
- ✅ Can navigate between pages
- ✅ No console errors

---

## What's Next?

### Immediate Next Steps:
1. [ ] Create 2-3 more rate items for different pay items
2. [ ] Import a real BOQ with multiple line items
3. [ ] Review the estimate breakdown
4. [ ] Export/print an estimate

### Learning Resources:
- 📖 Read `README.md` for overview
- 📖 Check `FORMULAS.md` for calculation details
- 📖 Review `API-TESTING.md` for API usage
- 📖 Study `SETUP.md` for detailed setup

### Development:
- 📝 Customize add-on percentages as needed
- 📝 Add more labor/equipment/material categories
- 📝 Adjust styling in `globals.css`
- 📝 Extend functionality as required

---

## Quick Reference

### Important URLs:
- Home: http://localhost:3000
- Rate Items: http://localhost:3000/rates
- New Rate: http://localhost:3000/rates/new
- New Estimate: http://localhost:3000/estimate/new

### Important Commands:
```powershell
# Start dev server
npm run dev

# Stop dev server
Ctrl + C

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint
```

### File Locations:
- Environment: `.env.local`
- API Routes: `src/app/api/`
- Pages: `src/app/`
- Schemas: `src/models/`
- Pricing: `src/lib/pricing-engine.ts`

---

## Support

If you encounter issues:
1. Check this checklist
2. Review error messages in console
3. Check MongoDB connection
4. Verify all dependencies installed
5. Restart dev server

For detailed help, see:
- `SETUP.md` - Installation guide
- `PROJECT-SUMMARY.md` - Complete overview
- `API-TESTING.md` - API examples

---

## Verification Checklist

Before proceeding with real work:
- [ ] MongoDB connected successfully
- [ ] Can access home page
- [ ] Can create rate items
- [ ] Can list rate items
- [ ] Search works
- [ ] Can create estimates
- [ ] Calculations are correct
- [ ] Can view estimate details
- [ ] Can delete items
- [ ] All pages load without errors

---

## 🎉 You're Ready!

Once all items above are checked, you're ready to:
- ✅ Start encoding your UPA rate items
- ✅ Import your project BOQs
- ✅ Generate detailed estimates
- ✅ Review cost breakdowns
- ✅ Export results

**Happy Estimating!** 🚀

---

**Estimated Setup Time:** 5-15 minutes  
**Skill Level Required:** Basic (can follow instructions)  
**Help Available:** Complete documentation in project folder
