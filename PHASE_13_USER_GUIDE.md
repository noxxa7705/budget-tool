# Phase 13: Transaction Enhancements - User Guide

## Overview
Phase 13 adds 10 powerful features to enhance transaction management in Night Ledger. You can now add detailed notes, track payment methods, detect duplicates, and much more.

## Feature 1: Multi-line Notes

**What it does:** Add detailed notes to any transaction beyond the basic description.

**How to use:**
1. Click the edit button on any transaction (or use the "+" button to add new)
2. Scroll to "Notes (Multi-line)" field
3. Type your detailed notes (supports multiple lines)
4. Examples:
   - Details about what was purchased
   - Reason for the expense
   - Cost breakdown
   - Personal reminders

**Why use it:** Keep detailed records without cluttering the transaction description.

---

## Feature 2: Attachment Support

**What it does:** Attach images, receipts, or documents to transactions.

**How to use:**
1. Open the transaction edit form
2. Scroll to "Attachments (Images/Files)"
3. Click "📎 Add Attachments"
4. Select one or multiple files (images, PDFs)
5. Selected files appear in the preview list
6. Click the "Remove" button to delete before saving
7. Save the transaction

**Supported formats:** Images (PNG, JPG, WebP) and PDFs

**Why use it:** Keep receipts and supporting documents right with the transaction for reference.

---

## Feature 3: Transaction Templates

**What it does:** Save recurring transactions as templates for quick reuse.

**How to use:**

### Saving a Template:
1. Open the transaction edit form
2. Fill in all the details (description, amount, location, etc.)
3. Check the box "Save as Template"
4. Enter a template name (e.g., "Weekly Groceries", "Gym Membership")
5. Save the transaction
6. Template is now saved!

### Using a Template:
1. Click the "+" button to add a new transaction
2. A "Templates" button will appear in the edit form
3. Click it to see your saved templates
4. Click "Use" on any template
5. The form pre-fills with template data
6. Edit any fields as needed
7. Save the transaction

**Why use it:** Quickly add recurring expenses without re-entering data each time.

---

## Feature 4: Bulk Edit

**What it does:** Update multiple transactions at once with the same changes.

**How to use:**
1. In the transactions list, select multiple transactions (checkbox support ready)
2. Click the "Bulk Edit" button
3. Choose which fields to update:
   - Update Category
   - Update Location
   - Update Payment Method
   - Add Tags
4. Only check the fields you want to change
5. Enter the new values
6. Click "Apply to X Transactions"
7. All selected transactions are updated instantly

**Example use cases:**
- Change payment method for a batch of cash transactions
- Recategorize a group of transactions
- Add location tags to transactions from a specific store
- Add tags for easier filtering

**Why use it:** Save time when correcting multiple transactions or reorganizing data.

---

## Feature 5: Split Transactions

**What it does:** Break down a single transaction into multiple line items (like a receipt with multiple categories).

**How to use:**
1. Open the transaction edit form
2. Check the box "Split Transaction (Multiple items)"
3. An items list appears with an "Add Item" button
4. For each item, enter:
   - Item description (e.g., "Milk", "Bread")
   - Amount for that item
5. Click "+ Add Item" to add more items
6. Click "Remove" to delete items
7. Save the transaction

**Example:** A grocery store receipt with multiple categories:
- Groceries: $25.50
- Household items: $12.00
- Dairy: $8.99

**Why use it:** Track exactly what you spent in different areas, even if paid in one transaction.

---

## Feature 6: Location Tagging

**What it does:** Record where the transaction happened for better analysis.

**How to use:**
1. Open the transaction edit form
2. Scroll to "Location"
3. Enter the merchant or location name
4. Examples:
   - "Whole Foods Market, Downtown"
   - "Target on 5th Street"
   - "Starbucks near work"
   - "Shell Gas Station, Highway 101"

**Why use it:** Analyze spending patterns by location and identify duplicate transactions from the same place.

---

## Feature 7: Payment Method Tracking

**What it does:** Record how you paid for each transaction.

**How to use:**
1. Open the transaction edit form
2. Select from the dropdown:
   - 💵 Cash
   - 💳 Credit Card
   - 💳 Debit Card
   - 📋 Check
   - 🏦 Bank Transfer
   - 📱 Mobile Pay

**Why use it:** Analyze payment habits and identify which payment methods you use most.

---

## Feature 8: OCR Correction

**What it does:** Edit and correct receipt data extracted from receipt photos.

**How to use:**
1. If you captured a receipt using the Camera feature (Phase 11)
2. Open the transaction edit form
3. Scroll to "OCR Correction"
4. The extracted data appears in editable fields:
   - Merchant name (correct if OCR got it wrong)
   - Total Amount (fix any errors)
   - Transaction Date (adjust if needed)
5. Make corrections
6. Save the transaction

**Why use it:** Ensure receipt data is accurate, since OCR isn't always perfect.

---

## Feature 9: Time-of-Day Tracking

**What it does:** Record not just what date, but what time of day you made the transaction.

**How to use:**
1. Open the transaction edit form
2. Scroll to "Date & Time"
3. Set the date using the date picker
4. Set the time using the time picker (24-hour format)
5. Examples:
   - Morning coffee at 08:30
   - Lunch at 12:45
   - Groceries at 18:15
6. Save the transaction

**Why use it:** Identify spending patterns by time of day. Do you spend more in mornings or evenings?

---

## Feature 10: Duplicate Detection

**What it does:** Automatically finds transactions that are likely duplicates.

**How to use:**
1. Click the "Check Duplicates" button (appears in main interface)
2. The app analyzes all transactions looking for similar ones
3. If duplicates are found, a modal shows them grouped
4. For each potential duplicate:
   - See the similarity percentage
   - Review the transaction details
   - Click "Delete Duplicate" to remove it
5. The duplicate is permanently deleted

**How it detects duplicates:**
- Similar description (50% weight)
- Similar amount (40% weight)
- Same or nearby date (10% weight)
- Must be 70% similar to be flagged

**Example:**
- Two "$25.00 Starbucks" transactions on the same day = likely duplicate
- "$25.00 grocery" vs "$24.99 grocery" same day = likely duplicate

**Why use it:** Avoid double-counting transactions from data entry errors or system glitches.

---

## Complete Workflow Example

### Scenario: You bought groceries at Whole Foods

1. **Capture receipt** (if using camera):
   - Take photo in Camera feature
   - OCR extracts data

2. **Edit & enhance the transaction:**
   - Open edit form
   - Add notes: "Weekly shopping, includes: milk, bread, eggs, vegetables"
   - Set location: "Whole Foods Market, Downtown"
   - Set payment method: "Credit Card"
   - Set time: 18:30 (when you shopped)
   - Attach the receipt image
   - Split if needed (groceries $40, household items $15)

3. **Save as template (optional):**
   - Check "Save as Template"
   - Name it "Weekly Groceries at Whole Foods"
   - Next week, just apply the template and update the date!

4. **Keep organized:**
   - Transaction has full context
   - Searchable by location
   - Attachments available for reference
   - Payment method tracked

---

## Tips & Best Practices

### Multi-line Notes
- Be descriptive but concise
- Include amounts for split items
- Note any unusual circumstances

### Templates
- Create templates for your regular, recurring expenses
- Name them clearly (e.g., "Monthly Gym", "Weekly Groceries")
- Include location and payment method in template

### Bulk Edit
- Use it when you have data entry errors to fix
- Perfect for recategorizing similar transactions
- Great for adding missing location tags

### Split Transactions
- Use for mixed-category purchases
- Helps accurate category spending reports
- Makes future searches easier

### Location Tagging
- Be consistent with location names
- Include neighborhood if helpful
- Useful for identifying spending patterns

### Payment Methods
- Always specify for expense tracking
- Helps identify which methods you prefer
- Useful for budgeting by payment type

### Time-of-Day
- Useful for identifying when you spend most
- Helps with spending pattern analysis
- Default is noon if not specified

### Duplicate Detection
- Run periodically to clean up your data
- Review flagged items before deleting
- 70% threshold minimizes false positives

---

## Keyboard Shortcuts (Coming Soon)

- `E` - Edit selected transaction
- `D` - Delete selected transaction
- `T` - Open templates
- `B` - Bulk edit mode

---

## FAQ

**Q: Do templates sync across devices?**
A: Currently stored locally. Export/import coming in future phases.

**Q: Can I edit a template after saving?**
A: Delete and recreate, or manually edit in transaction details.

**Q: What if duplicate detection flags a real transaction?**
A: Don't delete it! The modal shows both transactions for review.

**Q: Can I attach large files?**
A: Recommended max 5MB per file for localStorage limits.

**Q: Are attachments encrypted?**
A: Currently stored as metadata. Full encryption coming soon.

**Q: Can I bulk edit without selecting?**
A: Selection coming soon. Currently requires checkbox selection.

---

## Troubleshooting

**Templates not saving?**
- Check browser's localStorage is enabled
- Close and reopen the app
- Verify you set a template name

**Duplicates not detected?**
- Need 70% similarity minimum
- Check spelling and amounts match
- Dates must be within 1 day

**Attachments disappearing?**
- Browser storage cleared? 
- Try re-uploading
- Check file size isn't too large

**Split transaction math wrong?**
- Enter individual item amounts
- Subtotal is automatic
- Save and reopen to verify

---

## Next Steps

- **Phase 14**: Chart visualizations for time-of-day spending
- **Phase 15**: Location-based spending maps
- **Phase 16**: Cloud sync for templates and attachments
- **Phase 17**: Advanced duplicate resolution (merge)

Enjoy enhanced transaction management with Phase 13! 🎉
