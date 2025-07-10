# EcoTech Database Analysis

## 1. Tables, Fields, and Keys

### Table: `profiles`
- **Primary Key:** `id` (uuid)
- **Fields:**
  - id: uuid (PK)
  - name: text
  - email: text (unique)
  - role: text
  - phone: text
  - created_at: timestamptz (default: now())
  - status: text (default: 'active')
  - vehicle_type: text
  - license_number: text
  - coverage_area: text
  - availability: text
  - preferred_schedule: text
  - additional_info: text
  - center_name: text
  - address: text
  - operating_hours: text
  - accepted_materials: text[]
  - capacity: text
  - rejection_reason: text
  - collector_status: varchar (default: 'inactive')
  - profile_picture_url: text
  - date_of_birth: date
  - district: text
  - area: text
  - default_pickup_address: text
  - account_status: text (default: 'active')
  - bio: text
  - updated_at: timestamptz (default: now())
  - auto_id: integer (default: nextval)
  - password_hash: text
  - last_login: timestamptz
  - login_attempts: integer (default: 0)
  - locked_until: timestamptz
  - registration_number: text
  - center_latitude: numeric
  - center_longitude: numeric

### Table: `collection_requests`
- **Primary Key:** `id` (uuid)
- **Foreign Keys:**
  - user_id → profiles.id
  - collector_id → profiles.id
  - recycling_center_id → profiles.id
  - delivery_id → deliveries.id
- **Fields:**
  - id: uuid (PK)
  - user_id: uuid (FK)
  - status: text (default: 'pending')
  - item_types: text[]
  - quantities: text
  - preferred_date: date
  - preferred_time: text
  - address: text
  - contact_phone: text
  - special_instructions: text
  - collector_id: uuid (FK)
  - recycling_center_id: uuid (FK)
  - created_at: timestamptz (default: now())
  - updated_at: timestamptz (default: now())
  - completed_at: timestamptz
  - priority: text (default: 'medium')
  - scheduled_date: date
  - scheduled_time: text
  - collector_notes: text
  - processing_status: text
  - recycling_notes: text
  - delivery_id: uuid (FK)
  - item_categories: text[] (default: ARRAY[])
  - item_photos: text[] (default: ARRAY[])
  - contact_person: text
  - pickup_floor: text
  - building_access_info: text
  - items: jsonb (default: '[]')
  - total_amount: numeric (default: 0)
  - payment_method: text
  - payment_status: text (default: 'pending')
  - payment_intent_id: text
  - stripe_session_id: text
  - collector_commission: numeric (default: 0)
  - commission_paid: boolean (default: false)
  - commission_paid_at: timestamptz
  - original_scheduled_date: date
  - original_scheduled_time: text
  - reschedule_count: integer (default: 0)
  - reschedule_reason: text
  - last_rescheduled_at: timestamptz
  - collection_photos: text[]
  - photo_count: integer (default: 0)
  - photos_uploaded_at: timestamptz
  - currency: varchar (default: 'LKR')
  - sustainability_fund_amount: numeric (default: 0)
  - platform_revenue: numeric (default: 0)

### Table: `deliveries`
- **Primary Key:** `id` (uuid)
- **Foreign Keys:**
  - collection_request_id → collection_requests.id (unique)
  - collector_id → profiles.id
  - recycling_center_id → profiles.id
- **Fields:**
  - id: uuid (PK)
  - collection_request_id: uuid (FK, unique)
  - collector_id: uuid (FK)
  - recycling_center_id: uuid (FK)
  - status: text (default: 'delivered')
  - delivered_at: timestamptz
  - received_at: timestamptz
  - processed_at: timestamptz
  - collector_notes: text
  - delivery_notes: text
  - processing_notes: text
  - quality_assessment: jsonb
  - delivery_photos: text[]
  - item_condition: text (default: 'good')
  - contamination_level: text (default: 'none')
  - created_at: timestamptz (default: now())
  - updated_at: timestamptz (default: now())

### Table: `achievements`
- **Primary Key:** `id` (uuid)
- **Fields:**
  - id: uuid (PK)
  - name: text
  - description: text
  - icon: text
  - badge_color: text (default: '#10B981')
  - criteria: jsonb
  - points: integer (default: 0)
  - is_active: boolean (default: true)
  - created_at: timestamptz (default: now())

### Table: `user_achievements`
- **Primary Key:** `id` (uuid)
- **Foreign Keys:**
  - user_id → profiles.id
  - achievement_id → achievements.id
- **Fields:**
  - id: uuid (PK)
  - user_id: uuid (FK)
  - achievement_id: uuid (FK)
  - earned_at: timestamptz (default: now())
  - progress: jsonb

### Table: `feedback`
- **Primary Key:** `id` (uuid)
- **Foreign Keys:**
  - user_id → profiles.id
  - collection_request_id → collection_requests.id
- **Fields:**
  - id: uuid (PK)
  - user_id: uuid (FK)
  - feedback_type: text
  - subject: text
  - message: text
  - rating: integer
  - status: text (default: 'pending')
  - admin_response: text
  - collection_request_id: uuid (FK)
  - created_at: timestamptz (default: now())
  - updated_at: timestamptz (default: now())

### Table: `support_tickets`
- **Primary Key:** `id` (uuid)
- **Foreign Key:**
  - user_id → profiles.id
- **Fields:**
  - id: uuid (PK)
  - user_id: uuid (FK)
  - name: varchar
  - email: varchar
  - subject: varchar
  - category: varchar
  - priority: varchar (default: 'medium')
  - message: text
  - status: varchar (default: 'open')
  - admin_response: text
  - responded_at: timestamptz
  - created_at: timestamptz (default: now())
  - updated_at: timestamptz (default: now())

### Table: `pricing_categories`
- **Primary Key:** `id` (uuid)
- **Fields:**
  - id: uuid (PK)
  - category_key: text (unique)
  - name: text
  - description: text
  - price_per_item: numeric
  - is_active: boolean (default: true)
  - created_at: timestamptz (default: now())
  - updated_at: timestamptz (default: now())
  - currency: varchar (default: 'LKR')

### Table: `collector_earnings`
- **Primary Key:** `id` (uuid)
- **Foreign Keys:**
  - collector_id → profiles.id
  - collection_request_id → collection_requests.id (unique)
- **Fields:**
  - id: uuid (PK)
  - collector_id: uuid (FK)
  - collection_request_id: uuid (FK, unique)
  - amount: numeric
  - status: text (default: 'pending')
  - paid_at: timestamptz
  - created_at: timestamptz (default: now())
  - commission_percentage: numeric (default: 30.00)
  - currency: varchar (default: 'LKR')

### Table: `payment_transactions`
- **Primary Key:** `id` (uuid)
- **Foreign Key:**
  - collection_request_id → collection_requests.id
- **Fields:**
  - id: uuid (PK)
  - collection_request_id: uuid (FK)
  - stripe_payment_intent_id: text
  - stripe_session_id: text
  - amount: numeric
  - currency: text (default: 'usd')
  - status: text
  - payment_method: text
  - created_at: timestamptz (default: now())
  - updated_at: timestamptz (default: now())

### Table: `notifications`
- **Primary Key:** `id` (uuid)
- **Foreign Key:**
  - user_id → profiles.id
- **Fields:**
  - id: uuid (PK)
  - user_id: uuid (FK)
  - type: text
  - title: text
  - message: text
  - data: jsonb (default: '{}')
  - read: boolean (default: false)
  - action_url: text
  - related_id: uuid
  - created_at: timestamptz (default: now())
  - expires_at: timestamptz (default: now() + 30 days)

### Table: `sustainability_fund`
- **Primary Key:** `id` (uuid)
- **Foreign Keys:**
  - collection_request_id → collection_requests.id
  - user_id → profiles.id
- **Fields:**
  - id: uuid (PK)
  - collection_request_id: uuid (FK)
  - user_id: uuid (FK)
  - amount: numeric
  - currency: varchar (default: 'LKR')
  - created_at: timestamptz (default: now())
  - description: text

### Table: `platform_revenue`
- **Primary Key:** `id` (uuid)
- **Foreign Key:**
  - collection_request_id → collection_requests.id
- **Fields:**
  - id: uuid (PK)
  - collection_request_id: uuid (FK)
  - amount: numeric
  - currency: varchar (default: 'LKR')
  - percentage: numeric (default: 60.00)
  - created_at: timestamptz (default: now())

### Table: `content_categories`
- **Primary Key:** `id` (uuid)
- **Fields:**
  - id: uuid (PK)
  - name: text
  - description: text
  - slug: text (unique)
  - icon: text
  - sort_order: integer (default: 0)
  - is_active: boolean (default: true)
  - created_at: timestamptz (default: now())
  - updated_at: timestamptz (default: now())

### Table: `educational_content`
- **Primary Key:** `id` (uuid)
- **Foreign Keys:**
  - category_id → content_categories.id
  - author_id → profiles.id
- **Fields:**
  - id: uuid (PK)
  - title: text
  - slug: text (unique)
  - excerpt: text
  - content: text
  - featured_image_url: text
  - category_id: uuid (FK)
  - author_id: uuid (FK)
  - status: text (default: 'draft')
  - read_time_minutes: integer
  - views_count: integer (default: 0)
  - is_featured: boolean (default: false)
  - tags: text[]
  - meta_description: text
  - published_at: timestamptz
  - created_at: timestamptz (default: now())
  - updated_at: timestamptz (default: now())

---

## 2. Relationships Between Tables

- **profiles** is referenced by:
  - collection_requests (user_id, collector_id, recycling_center_id)
  - deliveries (collector_id, recycling_center_id)
  - user_achievements (user_id)
  - feedback (user_id)
  - support_tickets (user_id)
  - collector_earnings (collector_id)
  - notifications (user_id)
  - sustainability_fund (user_id)
  - educational_content (author_id)

- **collection_requests** is referenced by:
  - deliveries (collection_request_id)
  - feedback (collection_request_id)
  - collector_earnings (collection_request_id)
  - payment_transactions (collection_request_id)
  - sustainability_fund (collection_request_id)
  - platform_revenue (collection_request_id)

- **achievements** is referenced by:
  - user_achievements (achievement_id)

- **content_categories** is referenced by:
  - educational_content (category_id)

---

## 3. Normal Form Analysis

### 1NF (First Normal Form)
- **Satisfied:** All tables have atomic columns (no repeating groups, except for some arrays and jsonb fields, which are allowed in PostgreSQL but may violate strict 1NF in classic theory).
- **Evidence:** All fields are single-valued except for:
  - Arrays (e.g., `accepted_materials`, `item_types`, `item_photos`, `tags`)
  - JSONB fields (e.g., `items`, `criteria`, `progress`, `quality_assessment`, `data`)
- **Note:** Arrays and JSONB are common in modern PostgreSQL, but in strict relational theory, these would be decomposed into separate tables.

### 2NF (Second Normal Form)
- **Satisfied:** All non-prime attributes are fully functionally dependent on the whole primary key (all tables have single-column PKs).
- **Evidence:** No partial dependencies exist because there are no composite primary keys.

### 3NF (Third Normal Form)
- **Satisfied:** All non-key attributes are non-transitively dependent on the primary key.
- **Evidence:** No transitive dependencies detected in the schema as designed.

### BCNF (Boyce-Codd Normal Form)
- **Mostly Satisfied:** All determinants are candidate keys, except for possible issues with array and JSONB fields.
- **Evidence:** Most tables are in BCNF, but the use of arrays and JSONB can hide dependencies.

---

## 4. Normalization Issues & Recommendations

### Issues
- **Arrays and JSONB fields:**
  - `profiles.accepted_materials`, `collection_requests.item_types`, `collection_requests.item_photos`, `collection_requests.items`, `educational_content.tags`, etc. These fields may store multiple values in a single column, which is not strictly 1NF.
  - `collection_requests.items` (jsonb) can store a list of items per request, which could be normalized into a separate `request_items` table.
  - `achievements.criteria`, `user_achievements.progress`, `deliveries.quality_assessment`, `notifications.data` are all jsonb fields that may store structured data.

### Recommendations
- **For strict 1NF compliance:**
  - Decompose arrays and JSONB fields into separate tables (e.g., `profile_materials`, `request_items`, `content_tags`).
  - Each value in an array or object should be a row in a related table.
- **For BCNF/4NF compliance:**
  - Ensure all multi-valued dependencies are removed by creating linking tables for many-to-many relationships.
  - Review all JSONB fields to see if their structure can be represented relationally.
- **General:**
  - If you need to query/filter on values inside arrays or JSONB, normalization will improve performance and maintainability.
  - If arrays/JSONB are only used for display or rarely queried, current design is acceptable for many modern applications.

---

**Summary:**
- The schema is in 2NF/3NF for all practical purposes, but not in strict 1NF due to arrays and JSONB fields. For full normalization, consider decomposing these fields into separate tables. 