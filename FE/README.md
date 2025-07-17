# GenContract AI - Smart Data Contract Management System

A web application for managing smart data contracts with AI-powered automation, built with Next.js and designed to work with AWS API Gateway.

## 🚀 Features

- **Smart Contract Generation**: Create contracts from natural language descriptions
- **Contract Management**: Full CRUD operations for data contracts
- **AI Query Assistant**: Ask questions about contracts in natural language
- **Data Simulation**: Generate test data for BI and ML purposes
- **Compliance Monitoring**: Track violations and ensure contract compliance

## 🛠️ Local Development Setup

### 1. Clone and Install

\`\`\`bash
git clone <repository-url>
cd gencontract-ai
npm install
\`\`\`

### 2. Environment Configuration

Create a `.env.local` file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local`:

\`\`\`env
# Required: AWS API Gateway URL
NEXT_PUBLIC_API_URL="https://your-api-id.execute-api.us-east-1.amazonaws.com/dev"

# Optional: API Key (if your API Gateway uses API key authentication)
NEXT_PUBLIC_API_KEY="your-api-key-here"

# Optional: Environment identifier
NEXT_PUBLIC_ENVIRONMENT="development"
\`\`\`

### 3. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:3000`

## 🔧 AWS API Gateway Setup

Your AWS API Gateway should have these endpoints:

### Contract Management
- `GET /contracts` - List all contracts
- `GET /contracts/{id}` - Get contract by ID
- `POST /contracts` - Create new contract (expects `{input_data: {user: string, request: string}}`)
- `PUT /contracts/{id}` - Update contract
- `DELETE /contracts/{id}` - Delete contract

### Expected Response Format

#### Create Contract Request:
\`\`\`json
{
  "input_data": {
    "user": "john.doe@example.com",
    "request": "I need a contract for sharing customer data..."
  }
}
\`\`\`

#### Contract Response:
\`\`\`json
{
  "owner": "john.doe@example.com",
  "created_time": "2025-07-14T02:35:53.937619+00:00",
  "contract_id": "786442ac-60f3-4708-9a79-70d10bea86dd",
  "s3_path": "s3://gencontract-data/contracts/786442ac-60f3-4708-9a79-70d10bea86dd.yaml",
  "status": "DRAFT",
  "yaml": "```yaml\\ncontract_id: customer_data_sharing\\ndescription: Contract for sharing customer information..."
}
\`\`\`

### CORS Configuration

Enable CORS with these settings:

\`\`\`json
{
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Api-Key",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
}
\`\`\`

## 🐛 Troubleshooting

### API Connection Issues

1. **Check API URL**: Verify `NEXT_PUBLIC_API_URL` is correct
2. **Check CORS**: Ensure CORS is enabled in API Gateway
3. **Check API Key**: Verify API key if using authentication
4. **Check Request Format**: Ensure your Lambda expects the `input_data` format

### Mock Data Mode

If API is not configured, the app runs in mock data mode with sample contracts.

## 📁 Project Structure

\`\`\`
gencontract-ai/
├── app/                    # Next.js pages
├── components/            # UI components
├── lib/                   # API client and utilities
├── hooks/                 # React hooks
├── types/                 # TypeScript types
└── README.md
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)

1. Import repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically

### Environment Variables for Production

\`\`\`env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.com/prod
NEXT_PUBLIC_API_KEY=your-production-api-key
NEXT_PUBLIC_ENVIRONMENT=production
\`\`\`

## 📄 License

MIT License - see LICENSE file for details.
