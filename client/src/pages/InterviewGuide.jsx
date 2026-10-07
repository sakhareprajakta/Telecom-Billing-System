import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Layers,
  Lock,
  Calculator,
  Server,
  Zap,
} from 'lucide-react';

const InterviewGuide = () => {
  const [activeTab, setActiveTab] = useState('pitch'); // pitch | questions | architecture | billing
  const [expandedQ, setExpandedQ] = useState(null);

  const toggleQuestion = (index) => {
    setExpandedQ(expandedQ === index ? null : index);
  };

  const topQuestions = [
    {
      q: '1. Explain your telecom billing project end-to-end.',
      a: 'This application is a full-stack MERN telecom billing and subscriber management platform. The customer selects a subscription plan, incurs telecom usage (Data, Voice, SMS), and the authoritative backend billing engine calculates monthly charges by aggregating usage records against plan quotas. The system generates itemized tax invoices with GST and excess tariffs, processes payments idempotently through a payment gateway, and dispatches automated notifications.',
    },
    {
      q: '2. Why did you choose MERN for this application?',
      a: 'MERN provides a unified JavaScript/Node runtime across frontend and backend. React provides modular UI state management for dynamic billing dashboards; Express and Node offer high throughput for asynchronous CDR (Call Detail Record) event ingestion; and MongoDB documents naturally accommodate telecom usage logs, multi-attribute tariff plans, and JSON billing statements.',
    },
    {
      q: '3. Explain your React architecture.',
      a: 'We implemented a feature-based architecture separating common components (Button, Modal, DataTable, Loader) from domain components (billing, usage, customer, payment). Global auth state resides in AuthContext, while API communications are centralized in dedicated API services with automatic JWT injection and error interception.',
    },
    {
      q: '4. Explain your Node.js and Express architecture.',
      a: 'We adhered strictly to the Service Layer pattern. Controllers handle HTTP request parsing, status codes, and input validation; Services encapsulate pure business domain logic (such as billing rating algorithms and idempotency validation); Mongoose models represent persistent MongoDB collections; and centralized error middleware translates exceptions into consistent responses.',
    },
    {
      q: '5. Explain the request lifecycle from React to MongoDB.',
      a: 'React Component -> API Client (Bearer Token header) -> Express Router -> Auth Middleware (verify JWT) -> RBAC Middleware (check user.role) -> Validator -> Controller -> Service Layer -> Mongoose Model Query -> MongoDB Database -> Service/Controller JSON Response -> React Rendering & Cache update.',
    },
    {
      q: '6. How does JWT authentication work in this system?',
      a: 'Upon successful login (POST /api/auth/login), the backend compares passwords with bcrypt hashes and generates a signed JSON Web Token containing the user ID and role. The client stores this in localStorage and attaches it as an Authorization Bearer header. The protect middleware verifies the cryptographic signature before granting access to protected endpoints.',
    },
    {
      q: '7. How did you implement RBAC (Role-Based Access Control)?',
      a: 'We created an authorize(...roles) middleware. Roles include ADMIN, SUPPORT, and CUSTOMER. Admin can configure plans, run batch billing runs, and access all subscriber data; Support has read/write for assistance; Customers are strictly restricted to their own profile, usage records, invoices, and payment actions.',
    },
    {
      q: '8. How did you structure your MongoDB collections?',
      a: 'We have 8 collections: Users, Customers, Plans, Subscriptions, Usage, Invoices, Payments, and Notifications. Rather than storing millions of usage records inside a single unbounded customer array, Usage is a separate collection referencing customerId to prevent the 16MB document size limit.',
    },
    {
      q: '9. Why did you keep usage records separate from customer documents?',
      a: 'Telecom systems generate high-volume CDR streams (thousands of events per subscriber). Embedding them into a single customer document would exceed MongoDB’s 16MB BSON limit, cause huge document growth and re-allocation overhead, and make querying date ranges extremely inefficient.',
    },
    {
      q: '10. What indexes would you create?',
      a: 'users: { email: 1 } (unique); usageRecords: { customerId: 1, usageDate: -1 } and { customerId: 1, billingPeriod: 1 }; invoices: { customerId: 1, billingPeriod: -1 } and { invoiceNumber: 1 } (unique); payments: { customerId: 1, createdAt: -1 } and { transactionId: 1 } (unique); customers: { customerCode: 1 } (unique).',
    },
    {
      q: '11. How is billing calculated?',
      a: 'Final Amount = Base Plan Price + Extra Data Charge + Extra SMS Charge - Promotional Discount + Tax (18% GST). Extra data = max(0, actualDataGB - includedDataGB) * dataOverageRate. The backend verifies all numbers using database rates, never trusting browser calculations.',
    },
    {
      q: '12. Why should billing calculation happen on the backend?',
      a: 'Client-side state can be easily intercepted and altered in browser developer tools or API clients. Calculations must be authoritative, audited, and strictly performed on the backend against database tariff contracts.',
    },
    {
      q: '13. How do you prevent duplicate payments?',
      a: 'We enforce idempotency by accepting an Idempotency-Key header on payment requests. The backend verifies whether a payment with this key has already succeeded. We also verify that invoice.status is PENDING before processing, preventing duplicate capture.',
    },
    {
      q: '14. How would you handle payment failure?',
      a: 'Failed gateway attempts are recorded in the Payments collection with status: FAILED and error logs, keeping the invoice in PENDING status. The customer receives an immediate notification and can retry.',
    },
    {
      q: '15. How do you handle API errors consistently?',
      a: 'Centralized error middleware translates Mongoose ValidationError to 400, duplicate keys to 409, missing JWT to 401, unauthorized role access to 403, and unhandled errors to 500 with sanitized error messages.',
    },
    {
      q: '16. How did you manage global state?',
      a: 'User authentication credentials and current role are managed via React Context (AuthContext) and persisted in localStorage. Server state is fetched and synchronized through decoupled API services.',
    },
    {
      q: '17. Redux Toolkit vs Context API in this project?',
      a: 'Context API is ideal for lightweight global state such as authentication and theme. Redux Toolkit / RTK Query is preferred when state is complex, heavily mutated across sibling components, or requires advanced server-state caching.',
    },
    {
      q: '18. RTK Query / TanStack Query vs Redux?',
      a: 'RTK Query and TanStack Query excel at server-state synchronization (caching, background refetching, deduping requests, pagination). Redux is designed for client-only application state.',
    },
    {
      q: '19. How did you implement pagination?',
      a: 'Server-side pagination using skip((page - 1) * limit) and limit(limit) in MongoDB, returning total count, current page, and total pages to the frontend DataTable.',
    },
    {
      q: '20. How did you optimize React performance?',
      a: 'Reusable components, modular bundle structure, controlled re-renders, pagination for high-volume lists, and clean Tailwind styling without CSS bloating.',
    },
    {
      q: '21. How would you handle millions of usage records?',
      a: '1) Indexing on { customerId: 1, usageDate: -1 }; 2) Time-based sharding or MongoDB Time Series collections; 3) Periodic aggregation jobs to precompute daily/monthly summaries; 4) Archiving old CDR records into cold storage (S3/Glacier).',
    },
    {
      q: '22. How would you secure payment and billing APIs?',
      a: 'HTTPS in production, bcrypt password hashing, JWT with expiration, RBAC enforcement, strict schema validation, rate limiting (express-rate-limit), idempotency keys, and storing payment gateway keys in environment variables.',
    },
    {
      q: '23. How would you test the billing module?',
      a: 'Unit tests for the billing calculation formula with edge cases (exact limit, under limit, high overage, discount exceeding base, tax rounding); Integration tests verifying database updates, and end-to-end tests for checkout idempotency.',
    },
    {
      q: '24. How would you deploy the MERN application?',
      a: 'Containerize backend and frontend with Docker, deploy backend on Node hosting (AWS ECS, Render, or Railway) behind an Nginx reverse proxy, deploy React build on CDN (Vercel, Cloudflare, or AWS S3+CloudFront), and run MongoDB Atlas with automatic replica sets.',
    },
    {
      q: '25. How would you monitor production errors?',
      a: 'Integrate Sentry or Datadog for runtime exception capturing, Morgan/Winston for structured log streaming, and uptime monitoring for API health endpoints (/api/health).',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-blue-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> Complete MERN Stack Telecom Master Guide
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              Architecture & 25 Interview Questions
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Official interview preparation, request lifecycle diagrams, authoritative billing formulas, and architectural rationale directly grounded in your project specification document.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('pitch')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'pitch' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              45s Pitch
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'architecture' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Architecture & Flow
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'questions' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Top 25 Q&A
            </button>
          </div>
        </div>
      </div>

      {/* 45-Second Pitch View */}
      {activeTab === 'pitch' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Section 32: 45-Second Project Answer (Verbatim Specification)</span>
            </div>
            <blockquote className="p-4 bg-slate-50 border-l-4 border-blue-600 rounded-r-xl text-slate-700 text-sm italic leading-relaxed">
              "I worked on a telecom billing and customer management system built using the MERN stack. The application manages customer accounts, subscription plans, telecom usage, billing, invoices and payments. On the frontend, we used React.js with reusable components, Redux Toolkit and query-based server-state management. On the backend, Node.js and Express.js exposed REST APIs with JWT authentication, role-based authorization, validation, controllers and service-layer business logic. MongoDB stored customers, subscriptions, usage records, invoices and payments. The complete workflow starts with customer registration and plan selection, continues through usage tracking and backend billing calculation, and ends with invoice generation and payment processing through a payment gateway."
            </blockquote>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                If Explaining Your Full-Stack Role (Page 13)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                "I worked on the MERN-based telecom billing application across both frontend and backend modules. On the frontend I built React pages, reusable components, state management and API integration. On the backend I worked with Node.js and Express.js to build REST APIs, middleware, authentication, validation and business services, and used Mongoose to interact with MongoDB. I also worked on billing, invoice and payment workflows and handled error cases and performance considerations."
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                If Explaining A Frontend-Focused Role (Page 13)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                "My primary ownership was frontend, while I collaborated closely with the backend team on Node.js, Express.js and MongoDB APIs. I understand the complete backend flow and worked on API integration, request/response contracts, authentication and feature-level troubleshooting."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Architecture & Flow View */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Request Lifecycle diagram */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              Backend Request Lifecycle (Page 5 & 14)
            </h3>
            <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              {`HTTP Request (React Component / useQuery)
       │
       ▼
Express Router (api/billing, api/usage, etc.)
       │
       ▼
Authentication Middleware (verify JWT token)
       │
       ▼
Authorization / RBAC (ADMIN, CUSTOMER, SUPPORT check)
       │
       ▼
Validation Middleware (validate request body & inputs)
       │
       ▼
Controller (extracts parameters, sends HTTP codes)
       │
       ▼
Business Service (Authoritative calculations, billing rating)
       │
       ▼
Mongoose Model & Indexing (query or mutate document)
       │
       ▼
MongoDB Database Server
       │
       ▼
Service ➔ Controller ➔ JSON Response ➔ React UI State`}
            </div>
          </div>

          {/* Database Schema & Indexing Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              MongoDB Collections & Strategic Indexes (Page 7 & 8)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">users</span>
                <p className="text-slate-500 mb-2">name, email, passwordHash, role, status</p>
                <code className="text-blue-600 font-mono text-[11px] block bg-white p-1 rounded border">
                  &#123; email: 1 &#125; (Unique)
                </code>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">usageRecords (CDR)</span>
                <p className="text-slate-500 mb-2">customerId, type, quantity, unit, usageDate</p>
                <code className="text-blue-600 font-mono text-[11px] block bg-white p-1 rounded border">
                  &#123; customerId: 1, usageDate: -1 &#125;
                </code>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">invoices</span>
                <p className="text-slate-500 mb-2">invoiceNumber, customerId, period, total</p>
                <code className="text-blue-600 font-mono text-[11px] block bg-white p-1 rounded border">
                  &#123; customerId: 1, billingPeriod: -1 &#125;
                </code>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1">payments</span>
                <p className="text-slate-500 mb-2">invoiceId, customerId, amount, transactionId</p>
                <code className="text-blue-600 font-mono text-[11px] block bg-white p-1 rounded border">
                  &#123; customerId: 1, createdAt: -1 &#125;
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 25 Questions Accordion View */}
      {activeTab === 'questions' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <span>Click any question below to reveal the comprehensive interview model answer:</span>
            <span className="font-bold text-blue-600">25 Questions Available</span>
          </div>

          {topQuestions.map((item, idx) => {
            const isOpen = expandedQ === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleQuestion(idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-800">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 bg-blue-50/20 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InterviewGuide;
