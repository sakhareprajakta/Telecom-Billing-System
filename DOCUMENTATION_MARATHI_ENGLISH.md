# NexusTel — Telecom Billing & Customer Management System
## संपूर्ण प्रकल्प दस्तऐवजीकरण आणि कार्यप्रवाह (Complete Project Documentation & Workflow)
### भाषा: मराठी + English (Bilingual Architecture Guide)

---

## १. प्रकल्प परिचय (Project Overview & Introduction)

### 📌 English
**NexusTel** is a production-grade, enterprise web-based **Telecom Billing and Customer Management System** built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It handles complete telecom lifecycle operations: customer registration, 5G subscription plans, real-time Call Detail Record (CDR) ingestion, authoritative backend rating and billing calculations, itemized tax invoice generation, idempotent payment gateway processing, and automated alerts.

### 📌 मराठी (Marathi)
**NexusTel** ही **MERN Stack** (MongoDB, Express.js, React.js, Node.js) वर आधारित एक संपूर्ण आणि प्रगत **टेलिकॉम बिलिंग आणि ग्राहक व्यवस्थापन प्रणाली (Telecom Billing & Customer Management System)** आहे. या प्रणालीद्वारे टेलिकॉम ऑपरेटरचे संपूर्ण कामकाज चालवले जाते—जसे की नवीन ग्राहकांची नोंदणी, 5G टॅरिफ प्लॅन्स, रिअल-टाइम कॉल डिटेल रेकॉर्ड्स (CDR) डेटा वापर ट्रॅकिंग, बॅकएंडवर अचूक बिलिंग कॅल्क्युलेशन (Rating Engine), अधिकृत जीएसटी टॅक्स इन्व्हॉइस तयार करणे आणि सुरक्षित पेमेंट गेटवे प्रोसेसिंग.

---

## २. तांत्रिक स्टॅक (Technology Stack)

| स्तर (Layer) | तंत्रज्ञान (Technology) | भूमिका व महत्त्व (Role & Purpose) |
| :--- | :--- | :--- |
| **Frontend (क्लायंट)** | **React.js 18 + Vite** | जलद (Fast), रिॲक्टिव्ह आणि कॉम्पोनंट-आधारित युझर इंटरफेस |
| **Styling (स्टायलिंग)** | **Tailwind CSS** | पूर्णपणे रिस्पॉन्सिव्ह (Mobile, Tablet, Desktop) आधुनिक डिझाइन |
| **State Management** | **Redux Toolkit + Context API** | ग्लोबल ऑथेंटिकेशन आणि बिलिंग स्टेट व्यवस्थापन |
| **Icons & UI** | **Lucide React** | आधुनिक आणि सुटसुटीत व्हिज्युअल आयकॉन्स |
| **Backend (बॅकएंड)** | **Node.js + Express.js** | हाय-थ्रूपूट REST APIs, मिडलवेअर आणि सर्व्हिस लेयर लॉजिक |
| **Authentication** | **JWT (JSON Web Token) + Bcrypt** | सुरक्षित टोकन-आधारित लॉगिन आणि पासवर्ड हॅशिंग |
| **Authorization** | **RBAC (Role-Based Access Control)** | तिन्ही रोल्ससाठी स्वतंत्र अधिकार: `ADMIN`, `SUPPORT`, `CUSTOMER` |
| **Database (डेटाबेस)** | **MongoDB + Mongoose ODM** | नो-एसक्यूएल डॉक्युमेंट डेटाबेस, कंपाऊंड इंडेक्सिंग आणि ॲग्रिगेशन |
| **Testing (चाचणी)** | **Node Test Runner / Assert** | बिलिंग फॉर्म्युला आणि आयडेम्पोटन्सीसाठी ऑटोमेटेड टेस्ट सूट |
| **DevOps** | **Docker & Docker Compose** | संपूर्ण ॲपचे कंटेनरायझेशन (MongoDB, Server, Client Nginx) |

---

## ३. हाय-लेव्हल आर्किटेक्चर आणि रिक्वेस्ट लाइफसायकल (System Architecture & Request Lifecycle)

### 🔄 संपूर्ण डेटा फ्लो (End-to-End Data Flow)

```
 [वापरकर्ता / User] (Desktop / Mobile Browser)
       │
       ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    React.js Frontend (UI)                   │
 │  Dashboard │ Customers │ Plans │ Usage │ Billing │ Invoices │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                          HTTPS / REST API
                   (Headers: Authorization: Bearer <JWT>)
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                     Express.js Router                       │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                     Middleware Pipeline                     │
 │  1. cors() + express.json()                                 │
 │  2. auth.middleware.js (JWT व्हेरिफिकेशन)                   │
 │  3. role.middleware.js (RBAC परमिशन तपासणी)                 │
 │  4. validator.js       (इनपुट व्हॅलिडेशन)                   │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                      Controllers Layer                      │
 │  (HTTP रिक्वेस्ट हाताळणे, पॅरामिटर्स काढणे, स्टेटस कोड देणे) │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                     Service Layer Logic                     │
 │  • billing.service.js  (अधिकृत बिलिंग फॉर्म्युला कॅल्क्युलेशन)│
 │  • payment.service.js  (आयडेम्पोटन्ट पेमेंट गेटवे फ्लो)     │
 │  • usage.service.js    (सीडीआर डेटा पचवणे व पेजिनेशन)       │
 │  • notification.service.js (ईमेल/एसएमएस/ॲप नोटिफिकेशन्स)     │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                  Mongoose ODM & Models                      │
 │  (Compound Indexes: { customerId: 1, usageDate: -1 })       │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                   MongoDB Database Engine                   │
 │  (users, customers, plans, subscriptions, usage, invoices)  │
 └─────────────────────────────────────────────────────────────┘
```

---

## ४. मुख्य मॉड्यूल्स आणि सविस्तर कार्यप्रवाह (Core Modules & Detailed Flow)

### 🔹 मॉड्यूल १: ऑथेंटिकेशन आणि रोल-बेस्ड ॲक्सेस (JWT Authentication & RBAC)

#### इंग्रजी व मराठी फ्लो (Workflow):
1. **Login (लॉगिन)**:
   - वापरकर्ता ईमेल आणि पासवर्ड टाकतो (`POST /api/auth/login`).
   - बॅकएंड MongoDB मध्ये युझर शोधतो आणि `bcrypt.compare()` द्वारे पासवर्ड हॅश तपासतो.
   - योग्य असल्यास, वापरकर्त्याचा `id` आणि `role` समाविष्ट असलेले **JWT टोकन** जनरेट होते.
2. **Token Storage (टोकन साठवणे)**:
   - React Frontend हे टोकन `localStorage` मध्ये साठवते आणि प्रत्येक पुढील API कॉलमध्ये `Authorization: Bearer <token>` म्हणून पाठवते.
3. **RBAC परमिशन अंमलबजावणी (Role-Based Access Control)**:
   - **`ADMIN` (ॲडमिन)**: नवीन टॅरिफ प्लॅन तयार करणे, बल्क बिलिंग सायकल चालवणे, सर्व ग्राहकांचे डेटा पाहणे.
   - **`SUPPORT` (सपोर्ट)**: ग्राहकांचे 360° प्रोफाईल पाहणे, नेटवर्क इश्यू तपासणे, सिम कार्ड सस्पेंड/ॲक्टिव्हेट करणे.
   - **`CUSTOMER` (ग्राहक)**: स्वतःचा 5G डेटा वापर पाहणे, इन्व्हॉइस डाउनलोड करणे आणि ऑनलाईन पेमेंट करणे.

---

### 🔹 मॉड्यूल २: प्लॅन्स आणि सबस्क्रिप्शन व्यवस्थापन (Plans & Subscription Management)

- टेलिकॉम ऑपरेटरकडे विविध 5G प्लॅन्स असतात (उदा. Standard Saver 499, Unlimited Pro 799, Infinity Max 1299).
- प्रत्येक प्लॅनमध्ये:
  - **Monthly Price (मासिक भाडे)**: उदा. ₹499
  - **Included Data (समाविष्ट डेटा)**: उदा. 5 GB
  - **Included SMS (समाविष्ट एसएमएस)**: उदा. 100 SMS
  - **Call Policy (कॉलिंग धोरण)**: अमर्यादित लोकल आणि एसटीडी कॉल्स
  - **Data Overage Rate (अतिरिक्त डेटा दर)**: ₹50 प्रति GB
- जेव्हा ग्राहक नवीन प्लॅन निवडतो, तेव्हा जुने सबस्क्रिप्शन `UPGRADED` म्हणून मार्क होते आणि नवीन सबस्क्रिप्शन `ACTIVE` होते.

---

### 🔹 मॉड्यूल ३: टेलिकॉम युसेज आणि सीडीआर ट्रॅकिंग (Usage & CDR Tracking)

#### ❓ मुलाखतीचा मुख्य प्रश्न: लाखो युसेज रेकॉर्ड्स कसे सांभाळायचे? (Handling Millions of Usage Records)
- **इंग्रजी**: Instead of embedding millions of usage logs inside a single customer document (which would exceed MongoDB's 16MB document limit), usage records are stored in a dedicated `usageRecords` collection referencing `customerId`.
- **मराठी**: ग्राहकाच्या मूळ डॉक्युमेंटमध्ये लाखो कॉल किंवा डेटा नोंदी एम्बेड (Embed) केल्यास MongoDB ची **16MB डॉक्युमेंट मर्यादा संपून एरर येऊ शकते**. म्हणून `Usage` चे स्वतंत्र कलेक्शन तयार करून त्याला `customerId` ने जोडले आहे.
- **इंडेक्सिंग (Indexing)**:
  `{ customerId: 1, usageDate: -1 }` या कंपाऊंड इंडेक्समुळे लाखो रेकॉर्ड्समधून विशिष्ट महिन्याचा डेटा अवघ्या काही मिलिसेकंदांत मिळतो.
- **सीडीआर इनजेशन (CDR Ingestion API)**:
  ```http
  POST /api/usage
  {
    "customerId": "CUST1001",
    "type": "DATA",
    "quantity": 2.5,
    "unit": "GB"
  }
  ```

---

### 🔹 मॉड्यूल ४: अधिकृत बॅकएंड बिलिंग इंजिन (Authoritative Billing Engine)

> [!IMPORTANT]
> **सुवर्ण नियम (Golden Rule)**: बिलिंगचे कॅल्क्युलेशन कधीही ब्राउझर (Frontend) वर अवलंबून नसावे! सर्व कॅल्क्युलेशन डेटाबेसच्या अधिकृत दरांवरून **बॅकएंड सर्व्हिस लेयरमध्येच (`billing.service.js`)** झाले पाहिजे.

#### 🧮 अधिकृत बिलिंग सूत्र (The Rating Formula):
$$\text{Final Total} = \text{Base Plan Price} + \text{Extra Data Charge} + \text{Extra SMS Charge} - \text{Discount} + \text{GST Tax (18\%) }$$

#### 📊 पीडीएफमधील प्रत्यक्ष उदाहरण (Exact PDF Reference Example):

| बाबी (Component) | व्हॅल्यू (Value) | स्पष्टीकरण (Explanation) |
| :--- | :--- | :--- |
| **Base Plan Price** | **₹499** | Standard Saver 499 मासिक भाडे |
| **Included Data** | 5 GB | प्लॅनमध्ये समाविष्ट असलेला कोटा |
| **Actual Data Used** | 7 GB | ग्राहकाने वापरलेला एकूण डेटा |
| **Extra Data** | 2 GB | $7\text{ GB} - 5\text{ GB} = 2\text{ GB}$ अतिरिक्त डेटा |
| **Data Overage Rate** | ₹50/GB | अतिरिक्त प्रति GB दर |
| **Extra Data Charge** | **₹100** | $2\text{ GB} \times ₹50 = ₹100$ |
| **Extra SMS Charge** | **₹20** | मर्यादेबाहेर गेलेल्या एसएमएसचे शुल्क |
| **Promotional Discount** | **-₹50** | प्रोमो कोड / व्हाऊचर डिस्काउंट |
| **Subtotal (करपूर्व रक्कम)** | ₹569 | $₹499 + ₹100 + ₹20 - ₹50 = ₹569$ |
| **GST Tax (18%)** | **₹102** | $₹569 \times 0.18 = ₹102.42 \rightarrow \mathbf{₹102}$ |
| **एकूण देय रक्कम (Final Total)** | **₹671** | $₹569 + ₹102 = \mathbf{₹671}$ (अचूक जुळणी!) |

---

### 🔹 मॉड्यूल ५: इन्व्हॉइस आणि सुरक्षित पेमेंट गेटवे (Invoice & Idempotent Payments)

#### कार्यप्रवाह (Payment Flow):
1. ग्राहक इन्व्हॉइसवर **"Pay Now"** वर क्लिक करतो.
2. क्लायंट एक युनिक **Idempotency Key** जनरेट करतो (उदा. `PAY-INV10001-17932...`).
3. **बॅकएंड तपासणी (Validation)**:
   - इन्व्हॉइस अस्तित्वात आहे का?
   - इन्व्हॉइसचा स्टेटस `PENDING` आहे का? (जर अगोदरच `PAID` असेल, तर एरर 409 फेकतो).
   - पाठवलेली रक्कम इन्व्हॉइसच्या एकूण रकमेइतकीच आहे का?
4. **आयडेम्पोटन्सी संरक्षण (Idempotency Shield)**:
   - जर नेटवर्क ग्लिचमुळे युझरने दोनदा बटन दाबले, तरी बॅकएंड जुनाच व्यवहार परत करतो, **ग्राहकाचे पैसे दोनदा कट होत नाहीत**.
5. व्यवहार यशस्वी झाल्यावर:
   - इन्व्हॉइसचा स्टेटस **`PAID`** होतो.
   - `payments` कलेक्शनमध्ये `TXN-...` रेकॉर्ड सेव्ह होतो.
   - ग्राहकाला ॲपमध्ये आणि ईमेलवर **पेमेंट पावती (Receipt)** आणि नोटिफिकेशन मिळते.

---

## ५. डेटाबेस मॉडेल्स आणि स्ट्रक्चर (MongoDB Data Models)

```
users
├── _id (ObjectId)
├── name (String)
├── email (String, Unique Index)
├── passwordHash (Bcrypt String)
├── role (Enum: 'ADMIN', 'SUPPORT', 'CUSTOMER')
└── status (Enum: 'ACTIVE', 'INACTIVE')

customers
├── _id (ObjectId)
├── userId (Ref: User, Unique)
├── customerCode (String, Unique Index, e.g. "CUST1001")
├── phone (String)
├── address: { street, city, state, pincode }
└── accountStatus (Enum: 'ACTIVE', 'SUSPENDED', 'PENDING')

plans
├── _id (ObjectId)
├── name (String, e.g. "Standard Saver 499")
├── planCode (String, Unique)
├── monthlyPrice (Number, e.g. 499)
├── includedData (Number, e.g. 5)
├── dataOverageRate (Number, e.g. 50)
└── speed (String, e.g. "5G Ultra Speed")

usageRecords (CDR)
├── _id (ObjectId)
├── customerId (Ref: Customer, Compound Index)
├── type (Enum: 'DATA', 'VOICE', 'SMS')
├── quantity (Number)
├── unit (Enum: 'GB', 'MINS', 'SMS')
├── usageDate (Date, Compound Index)
└── billingPeriod (String, e.g. "2026-10")

invoices
├── _id (ObjectId)
├── invoiceNumber (String, Unique, e.g. "INV10001")
├── customerId (Ref: Customer)
├── billingPeriod (String)
├── baseAmount, usageAmount, discount, tax, totalAmount
├── status (Enum: 'PENDING', 'PAID', 'OVERDUE')
└── dueDate (Date)

payments
├── _id (ObjectId)
├── invoiceId (Ref: Invoice)
├── customerId (Ref: Customer)
├── amount (Number)
├── transactionId (String, Unique, e.g. "TXN-...")
├── idempotencyKey (String, Unique Index)
├── paymentMethod (Enum: 'UPI', 'CREDIT_CARD', 'NET_BANKING')
└── status (Enum: 'SUCCESS', 'FAILED')
```

---

## ६. प्रकल्प कसा चालवायचा? (How to Run the Project)

### 💻 कमांड्स (Terminal Commands)

```bash
# १. सर्व्हर आणि क्लायंट दोन्ही एकत्र सुरू करा (Concurrent Run)
npm run dev

# २. ऑटोमेटेड बिलिंग फॉर्म्युला टेस्ट रन करा
npm test

# ३. डेटाबेसमध्ये सॅम्पल डेटा भरा (Re-Seed Database)
npm run seed
```

### 🔑 थेट लॉगिन क्रेडेंशियल्स (Demo Credentials)

| रोल (Role) | ईमेल (Email) | पासवर्ड (Password) | वैशिष्ट्ये (Features to Test) |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@telecom.com` | `Password@123` | प्लॅन तयार करणे, बल्क बिलिंग सायकल चालवणे, महसूल आकडेवारी |
| **Support** | `support@telecom.com` | `Password@123` | ग्राहकांचे प्रोफाईल शोधणे, सीडीआर लॉग्स तपासणे, खाते सस्पेंड करणे |
| **Customer** | `customer@telecom.com` | `Password@123` | आरव शर्मा (`CUST1001`), 5G वापर तपासणे, ₹671 चे बिल भरणे |

---

## ७. इंटरव्ह्यू 45-सेकंद उत्तर (45-Second Project Answer for Interviews)

### 🎙️ English Pitch:
> "I built an end-to-end Telecom Billing and Customer Management System using the MERN stack. The platform manages subscriber accounts, 5G tariff plans, real-time CDR usage tracking, authoritative backend billing calculations, itemized tax invoices, and payment processing. On the frontend, we used React.js with reusable components, Redux Toolkit, and query-based state handling. On the backend, Node.js and Express.js expose secure REST APIs protected by JWT authentication and RBAC. MongoDB stores customers, subscriptions, CDR usage, and invoices with compound indexes to handle high-volume data efficiently. A key highlight is our authoritative rating engine that calculates overage tariffs, discounts, and GST on the backend, alongside an idempotent payment gateway that prevents duplicate billing."

### 🎙️ मराठी सादरीकरण (Marathi Pitch):
> "मी MERN Stack चा वापर करून एक संपूर्ण 'टेलिकॉम बिलिंग आणि ग्राहक व्यवस्थापन प्रणाली' विकसित केली आहे. ही प्रणाली टेलिकॉम ग्राहकांची खाती, 5G टॅरिफ प्लॅन्स, रिअल-टाइम कॉल डिटेल रेकॉर्ड्स (CDR), बॅकएंड बिलिंग कॅल्क्युलेशन, टॅक्स इन्व्हॉइस आणि पेमेंट गेटवे हाताळते. फ्रन्टएंडसाठी React.js, Tailwind CSS आणि Redux Toolkit वापरले आहे. बॅकएंडवर Node.js आणि Express.js द्वारे REST APIs तयार करून त्यांना JWT आणि RBAC द्वारे सुरक्षित केले आहे. डेटाबेसमध्ये लाखो सीडीआर नोंदी जलद गतीने शोधण्यासाठी MongoDB वर कंपाऊंड इंडेक्सिंग केले आहे. या प्रकल्पाचे मुख्य वैशिष्ट्य म्हणजे अधिकृत बॅकएंड बिलिंग इंजिन (जे डेटा ओव्हरेज, सवलत आणि १८% जीएसटी अचूक मोजते) आणि आयडेम्पोटन्ट पेमेंट गेटवे (जेणेकरून ग्राहकाचे पैसे चुकून दोनदा कट होत नाहीत)."

---

## ८. वारंवार विचारले जाणारे महत्त्वाचे प्रश्न (Top 5 Interview Questions & Answers)

1. **प्रश्न: बिलिंग कॅल्क्युलेशन फ्रन्टएंडवर का करू नये? (Why calculate on backend?)**
   - **उत्तर**: ब्राउझरमधील JavaScript कोड इन्स्पेक्ट किंवा बदलता येतो. जर फ्रन्टएंडवर बिल कॅल्क्युलेट केले, तर कोणीही किंमत ₹० करून फसवणूक करू शकते. त्यामुळे डेटाबेसमधील अधिकृत दरांवरून बॅकएंडवरच बिलिंग झाले पाहिजे.
2. **प्रश्न: डुप्लिकेट पेमेंट कसे टाळले? (How to prevent duplicate payments?)**
   - **उत्तर**: प्रत्येक पेमेंट विनंतीसोबत `Idempotency-Key` पाठवला जातो. बॅकएंड आधी तपासतो की या की वरून अगोदर व्यवहार झाला आहे का आणि इन्व्हॉइसचा स्टेटस `PENDING` आहे का. त्यामुळे एकाच बिलाचे दोनदा पैसे कट होत नाहीत.
3. **प्रश्न: सीडीआर (CDR) डेटा वेगळ्या कलेक्शनमध्ये का ठेवला?**
   - **उत्तर**: एका ग्राहकाचे हजारो कॉल व डेटा लॉग्स असतात. ते ग्राहकाच्या एकाच डॉक्युमेंटमध्ये ठेवल्यास MongoDB ची **16MB साईझ मर्यादा संपेल**. म्हणून `Usage` चे स्वतंत्र कलेक्शन करून `{ customerId: 1, usageDate: -1 }` इंडेक्स लावला आहे.
4. **प्रश्न: RBAC कसा लागू केला?**
   - **उत्तर**: `role.middleware.js` मध्ये `authorize('ADMIN', 'SUPPORT')` फंक्शन तयार केले, जे JWT डिकोड झाल्यावर युझरचा रोल तपासूनच सुरक्षित API मध्ये प्रवेश देते.
5. **प्रश्न: सिस्टीमचे ऑटोमेटेड टेस्टिंग कसे केले?**
   - **उत्तर**: `npm test` द्वारे युनिट आणि इंटिग्रेशन टेस्ट तयार केल्या आहेत, ज्या प्रत्यक्ष डेटाबेसशी कनेक्ट होऊन पीडीएफमधील ₹६७१ चे सूत्र ($499 + 100 + 20 - 50 + 102$) आणि पेमेंट आयडेम्पोटन्सी आपोआप व्हेरिफाय करतात.
