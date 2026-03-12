# End-to-End (E2E) Tests

Comprehensive E2E test suite for the FMS Admin Panel using Playwright.

## Overview

This test suite covers:
- **Authentication** - Login, logout, signup flows
- **Dashboard** - Data display, loading states, error handling
- **Navigation** - Menu navigation, route protection
- **RBAC** - Role-based access control for all user roles
- **API Integration** - API calls, error handling, retries
- **Responsive Design** - Mobile, tablet, desktop viewports
- **Signup** - User registration flow

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
# Install dependencies (includes Playwright)
npm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/dashboard.spec.ts
```

### Run tests for specific browser
```bash
npx playwright test --project=chromium
```

### Run tests in parallel (faster)
```bash
npx playwright test --workers=4
```

## Test Structure

```
e2e/
├── playwright.config.ts    # Playwright configuration
├── tests/                   # Test files
│   ├── auth.spec.ts        # Authentication tests
│   ├── dashboard.spec.ts   # Dashboard functionality
│   ├── navigation.spec.ts  # Navigation tests
│   ├── rbac.spec.ts        # Role-based access control
│   ├── signup.spec.ts      # Signup flow
│   ├── api-integration.spec.ts  # API integration
│   └── responsive.spec.ts  # Responsive design
└── pages/                  # Page Object Models
    ├── LoginPage.ts        # Login page interactions
    └── DashboardPage.ts    # Dashboard page interactions
```

## Test Coverage

### Authentication Tests (`auth.spec.ts`)
- ✅ Login page display
- ✅ Form validation
- ✅ Invalid credentials handling
- ✅ Successful login
- ✅ Password visibility toggle
- ✅ Navigation to signup
- ✅ Remember me checkbox
- ✅ Logout functionality
- ✅ Redirect authenticated users

### Dashboard Tests (`dashboard.spec.ts`)
- ✅ Dashboard elements display
- ✅ Stats cards with data
- ✅ Recent bookings table
- ✅ Booking statistics
- ✅ Productivity chart
- ✅ Quick stats section
- ✅ Loading states
- ✅ Error handling
- ✅ Retry functionality
- ✅ Amount formatting
- ✅ Growth percentages

### Navigation Tests (`navigation.spec.ts`)
- ✅ Navigate to all menu items
- ✅ Active menu item highlighting
- ✅ User profile display
- ✅ Logout button
- ✅ Sidebar persistence
- ✅ Route navigation

### RBAC Tests (`rbac.spec.ts`)
- ✅ Super Admin access (all pages)
- ✅ Operations Admin access (limited)
- ✅ Finance Admin access (limited)
- ✅ Support Agent access (limited)
- ✅ Compliance Officer access (limited)
- ✅ Unauthorized redirects
- ✅ Direct URL access prevention
- ✅ Role display in sidebar

### Signup Tests (`signup.spec.ts`)
- ✅ Signup page display
- ✅ Form validation
- ✅ Password mismatch error
- ✅ Password length validation
- ✅ Role selection
- ✅ Password visibility toggle
- ✅ Terms acceptance requirement
- ✅ Navigation to login
- ✅ Successful signup

### API Integration Tests (`api-integration.spec.ts`)
- ✅ API endpoint calls
- ✅ Authentication token inclusion
- ✅ Error response handling
- ✅ Network error handling
- ✅ Retry functionality
- ✅ Query parameters
- ✅ Empty response handling

### Responsive Tests (`responsive.spec.ts`)
- ✅ Mobile viewport (375x667)
- ✅ Tablet viewport (768x1024)
- ✅ Desktop viewport (1920x1080)
- ✅ Table overflow handling
- ✅ Sidebar functionality
- ✅ Chart resizing

## Page Object Model (POM)

The tests use the Page Object Model pattern for better maintainability:

### LoginPage
- `login(email, password)` - Perform login
- `togglePasswordVisibility()` - Toggle password field
- Properties for all form elements

### DashboardPage
- `waitForDataLoad()` - Wait for API data
- `navigateToMenuItem(name)` - Navigate via menu
- `logout()` - Perform logout
- `getStatValue(name)` - Get stat card value
- `refreshData()` - Reload dashboard

## Configuration

### Playwright Config (`playwright.config.ts`)

- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Trace**: On first retry
- **Web Server**: Auto-starts dev server

### Environment Variables

Create `.env` file (Vite uses `VITE_` prefix):
```env
VITE_API_URL=https://api.fms.com/v1
```

## Debugging

### View Test Report
```bash
npm run test:e2e:report
```

### Debug Single Test
```bash
npx playwright test tests/dashboard.spec.ts --debug
```

### Screenshots and Videos
- Screenshots: `test-results/` (on failure)
- Videos: `test-results/` (on failure)
- Traces: `test-results/` (on retry)

### View Trace
```bash
npx playwright show-trace test-results/trace.zip
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

1. **Use Page Objects** - Keep selectors in page objects
2. **Wait for Elements** - Use `waitFor` instead of `sleep`
3. **Test Isolation** - Each test should be independent
4. **Clean State** - Use `beforeEach` for setup
5. **Meaningful Names** - Use descriptive test names
6. **Assertions** - Use specific assertions
7. **Error Handling** - Test error scenarios
8. **API Mocking** - Mock API calls when needed

## Troubleshooting

### Tests fail with "Navigation timeout"
- Check if dev server is running on port 5173
- Increase timeout in `playwright.config.ts`

### Tests fail with "Element not found"
- Check if selectors match current UI
- Use Playwright Inspector to debug: `npm run test:e2e:debug`

### API calls fail
- Ensure API endpoints are accessible
- Check authentication token is valid
- Use network tab in Playwright Inspector

### Browser not found
```bash
npx playwright install
```

## Contributing

When adding new tests:
1. Follow existing test structure
2. Use Page Object Model
3. Add meaningful test descriptions
4. Include both positive and negative cases
5. Test error scenarios
6. Update this README

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)
