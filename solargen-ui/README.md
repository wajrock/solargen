# SolarGen UI

> Part of the [SolarGen](../README.md) project. See the root README for the full architecture overview.

**Live demo:** [solargen.wajrock.me](https://solargen.wajrock.me)

Fully responsive React dashboard for monitoring and forecasting solar production across the Bundoora campus. It consumes the [`solargen-backend`](../solargen-backend) API to display daily predictions, site comparisons, historical trends, and model performance metrics.

## Tech Stack

- **React / TypeScript**: UI framework
- **TanStack Query**: server state management, caching
- **TanStack Table**: sortable data tables
- **Recharts**: data visualization
- **shadcn/ui**: accessible UI primitives (Select, Tooltip, Popover, Calendar, Dropdown)
- **Vitest**: unit testing

## Features

- **Overview**: daily predictions, capacity factor, CO₂ savings, and estimated energy value, benchmarked against the monthly average, with hourly production and weather charts
- **Installation**: comparative view of all 21 sites, sortable and filterable by performance level, inverter model, and search
- **History**: month-over-month production comparison between the current and previous year, with a daily production chart
- **ML Model**: model performance metrics, input features, and the status of the latest prediction run
- **Settings**: theme preference, configurable CO₂ emission rate and electricity tariff (AUD/kWh), and useful resource links

## Key Architecture Components

```
src/
├── pages/
│   ├── Overview/       # Daily predictions and charts
│   ├── Installation/   # Site metadata, performance comparison, and filtering
│   ├── History/        # Month-by-month year-over-year comparison
│   ├── Model/          # Model metrics and prediction status
│   └── Settings/       # Preferences, calculation variables, and useful links
├── components/
│   ├── layout/         # Navbar, mobile header
│   ├── shared/         # Reusable components
│   └── ui/             # shadcn UI based primitives
├── hooks/              # Data fetching, current time, and dashboard configuration variables
├── services/           # API client functions
├── types/              # Shared TypeScript types
└── utils/              # Formatters, date helpers, validators, site statistics
```

## Testing

The test suite does not require any environment configuration.

Latest test results:

| Type       | Test Suites          | Tests                  |
| ---------- | -------------------- | ---------------------- |
| Unit tests | 46 passed / 46 total | 288 passed / 288 total |

Unit tests coverage report:

| % Statements | % Branches | % Functions | % Lines |
| ------------ | ---------- | ----------- | ------- |
| 93.46        | 94.86      | 87.64       | 93.33   |

```bash
npm install
npm run test        # unit tests
npm run test:cov    # unit tests with coverage report
```

Unit tests cover hooks, utility functions, and components with meaningful conditional logic (loading, error, and empty states in particular).

## CI/CD & Deployment

The service is deployed to [Hostinger](https://www.hostinger.com/) through a GitHub Actions pipeline:

| Stage       | Description                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Trigger     | A push touching `solargen-ui/` triggers the workflow. Path-based rules keep each service's pipeline independent. |
| Lint & test | Dependencies are installed, then the code is linted and unit-tested. A failure at any step stops the workflow.   |
| Build       | The Vite production bundle is built.                                                                             |
| Deploy      | The build output is deployed to Hostinger over FTP.                                                              |
