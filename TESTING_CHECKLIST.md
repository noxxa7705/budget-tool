# Night Ledger Phase 1 - Testing Checklist

## Pre-Testing Setup
- [ ] Clear browser cache/localStorage
- [ ] Configure LLM endpoint in Settings (optional for some features)
- [ ] Create test transactions with various descriptions
- [ ] Note current month and previous month data

## Dashboard - AI Insight Banner

### Display & Appearance
- [ ] Banner appears at top of dashboard
- [ ] Banner has gradient background and sparkle emoji (✨)
- [ ] Loading state shows "Analyzing spending patterns..."
- [ ] Loading state has spinning animation

### Functionality
- [ ] Insight displays after 1-3 seconds (depends on LLM)
- [ ] Insight text is readable and makes sense
- [ ] Refresh button (🔄) is clickable
- [ ] Refresh button becomes active again after fetch
- [ ] Banner updates when transactions are added
- [ ] Banner updates when transactions are deleted
- [ ] Works gracefully when LLM not configured (banner hidden)
- [ ] Console has no errors during fetch

### Edge Cases
- [ ] Works with no transactions
- [ ] Works with only income
- [ ] Works with only expenses
- [ ] Works when API connection fails (graceful error)
- [ ] Fetches on page load automatically

## Dashboard - Summary Cards (Income & Expenses)

### Month-over-Month Deltas
- [ ] Delta badge appears on Income card
- [ ] Delta badge appears on Expense card
- [ ] Badge shows percentage value (e.g., "↑ 12.5%")
- [ ] Badge shows correct directional indicator:
  - [ ] ↑ when increase (red background)
  - [ ] ↓ when decrease (green background)
  - [ ] → when flat/no change (gray background)
- [ ] Colors match design (red=#f87171, green=#4ade80)
- [ ] Badge updates when new transactions added
- [ ] Calculation is accurate (verify manually if possible)

### Sparkline Charts
- [ ] Sparkline appears below each card value
- [ ] Income sparkline is green (#10b981)
- [ ] Expense sparkline is red (#ef4444)
- [ ] Charts show 6-month trend line
- [ ] Charts have gradient fill below line
- [ ] Charts are responsive to card width
- [ ] Charts update reactively as data changes
- [ ] SVG renders without errors (no blank space)

### Card Layout
- [ ] Card header with label and badge aligned properly
- [ ] Card value (currency) displays correctly
- [ ] Sparkline positioned below value with spacing
- [ ] No overflow or layout issues on mobile

## Transaction Modal - Category Predictions

### Display & Appearance
- [ ] Prediction section appears below description field
- [ ] Prediction section has border-top separator
- [ ] Section labeled "Suggested categories:"
- [ ] Prediction chips show emoji from category

### Functionality
- [ ] As user types description, predictions appear ~500ms delay
- [ ] Predictions disappear if description becomes empty
- [ ] Shows up to 3 prediction chips
- [ ] Each chip shows emoji + confidence label:
  - [ ] First chip: "High"
  - [ ] Second chip: "Med"
  - [ ] Third chip: "Low"
- [ ] Clicking chip updates quickAdd.category
- [ ] Selected category gets active styling in chips below
- [ ] Loading spinner shows while analyzing

### Prediction Quality
- [ ] "grocery store" → suggests Groceries, Shopping
- [ ] "coffee" → suggests Coffee, Dining
- [ ] "gas station" → suggests Gas, Transport
- [ ] "doctor visit" → suggests Healthcare
- [ ] Predictions make logical sense
- [ ] Correct category can be selected

### Edge Cases
- [ ] No predictions if LLM not configured
- [ ] Predictions clear after transaction added
- [ ] Previous request cancelled if user types quickly
- [ ] Works with special characters in description
- [ ] Works with long descriptions (100+ chars)
- [ ] Works with very short descriptions (1-2 chars)

## Transaction Management

### Adding Transactions
- [ ] Transaction added successfully with prediction
- [ ] AI insight banner refreshes after add
- [ ] Prediction section clears after adding
- [ ] Transaction appears in list immediately
- [ ] Account balance updates correctly

### Deleting Transactions
- [ ] Transaction deleted successfully
- [ ] AI insight banner refreshes after delete
- [ ] Account balance updates correctly
- [ ] Sparklines update after delete

### Duplicating Transactions
- [ ] Transaction duplicated successfully
- [ ] AI insight banner refreshes after duplicate
- [ ] New date set to today
- [ ] Category predictions work on duplicate

## Settings & Configuration

### LLM Endpoint Configuration
- [ ] Can input LLM endpoint in settings
- [ ] Can input API key in settings
- [ ] Settings persist (reload page, check values)
- [ ] Test connection button works
- [ ] Connection status updates correctly

### Feature Behavior Without LLM
- [ ] Dashboard loads without LLM endpoint
- [ ] AI banner is hidden/not shown
- [ ] Predictions section doesn't appear
- [ ] All other features work normally
- [ ] No console errors

## Mobile & Responsive

### Mobile Layout
- [ ] Dashboard cards stack on mobile
- [ ] Sparklines still visible on mobile
- [ ] Delta badges don't overflow
- [ ] AI banner wraps text properly
- [ ] Prediction chips wrap to next line
- [ ] Touch interactions work (no hover issues)

### Tablet Layout
- [ ] 2-column grid layout works
- [ ] Cards readable on tablet width
- [ ] Modal scrolls properly on small height
- [ ] Keyboard interactions work (mobile keyboard)

## Dark Theme Compliance

### Visual Design
- [ ] AI banner matches dark Sigma theme
- [ ] Sparklines match theme colors
- [ ] Delta badges match theme colors
- [ ] Prediction chips match theme styling
- [ ] No jarring color mismatches
- [ ] Text contrast is readable (WCAG AA)
- [ ] Gradient backgrounds are subtle

### Animations
- [ ] SlideIn animation for banner (smooth)
- [ ] Spinner animation (smooth rotation)
- [ ] Hover effects on prediction chips
- [ ] No flickering or jumping

## Performance

### Load Time
- [ ] Dashboard initial load unchanged
- [ ] No jank when typing description
- [ ] Sparklines render instantly
- [ ] Delta badges compute instantly

### API Calls
- [ ] Only 1 AI insight fetch on dashboard load
- [ ] Refresh button triggers 1 new fetch
- [ ] Category predictions: 1 fetch per 500ms typing
- [ ] Previous requests cancelled properly

### Memory
- [ ] No memory leaks (check DevTools)
- [ ] Browser doesn't slow down after 1 hour use
- [ ] Page closes cleanly

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome 90+ ✓
- [ ] Firefox 88+ ✓
- [ ] Safari 14+ ✓
- [ ] Edge 90+ ✓

### Mobile Browsers
- [ ] Chrome Android ✓
- [ ] Safari iOS ✓
- [ ] Firefox Mobile ✓
- [ ] Samsung Internet ✓

## Data Integrity

### Existing Data
- [ ] Old transactions load correctly
- [ ] Account balances accurate
- [ ] Categories display correctly
- [ ] No data migration issues

### New Data
- [ ] New transactions save correctly
- [ ] Predictions don't affect data
- [ ] AI insight doesn't modify data
- [ ] Settings persist correctly

## Console & Errors

### JavaScript Errors
- [ ] No JS errors on dashboard load
- [ ] No errors when typing description
- [ ] No errors when adding transaction
- [ ] No errors when modal opens
- [ ] No network errors in console (unless intentional)

### Network Requests
- [ ] LLM API calls use correct endpoint
- [ ] API keys sent securely (HTTPS)
- [ ] No API key exposed in console/network tab
- [ ] Proper error handling for failed requests

## Accessibility

### Keyboard Navigation
- [ ] Can tab through prediction chips
- [ ] Can Enter to select prediction
- [ ] Description field keyboard accessible
- [ ] Modal keyboard shortcuts work (Escape to close)

### Screen Readers
- [ ] AI banner labeled correctly
- [ ] Prediction chips have proper labels
- [ ] Loading states announced
- [ ] Delta badges are descriptive

## Known Limitations

- [ ] Category predictions require LLM endpoint (documented)
- [ ] AI insight requires LLM endpoint (documented)
- [ ] First call may take 1-3 seconds (expected)
- [ ] Sparklines based on 6 months data (fixed window)

## Sign-Off

### QA Tester Information
- Name: _________________
- Date: _________________
- Browser: _________________
- Device: _________________
- LLM Endpoint Tested: ☐ Yes ☐ No

### Overall Assessment
- [ ] All tests passed
- [ ] No blocking issues
- [ ] Ready for production
- [ ] Recommend with comments

### Comments & Issues Found
```
[Document any issues found, even minor ones]


```

### Sign-Off
- [ ] QA approved
- [ ] Ready to merge
- [ ] Ready to deploy

---

**Total Checklist Items**: ~120
**Estimated Time**: 2-3 hours comprehensive testing
