# EcoTech App - Entity Relationship Diagram (ERD)

This document provides a detailed breakdown of the EcoTech application's database schema, including its entities, attributes, and relationships. It concludes with a full Entity Relationship Diagram (ERD) generated using Mermaid syntax.

## 1. Entities

Entities are the main objects in your system, which correspond to the tables in your database.

-   **`profiles`**: The central entity representing all users (general users, collectors, recycling center staff). It's a polymorphic entity that holds data for different roles.
-   **`collection_requests`**: A core transactional entity that captures all details of a user's request to have e-waste collected.
-   **`deliveries`**: Tracks the physical delivery of collected items from a collector to a recycling center.
-   **`achievements`**: Defines the criteria for gamification badges and awards.
-   **`user_achievements`**: A linking table that connects users to the achievements they have earned.
-   **`feedback`**: Stores feedback provided by users, which can be general or tied to a specific collection request.
-   **`support_tickets`**: Manages user-submitted support requests and their resolution.
-   **`pricing_categories`**: A reference table for the pricing of different e-waste items for paid collections.
-   **`collector_earnings`**: Tracks the commission earned by collectors from paid collection requests.
-   **`payment_transactions`**: Records all payment-related transactions, primarily for paid collections.
-   **`notifications`**: Stores system-generated notifications for users.
-   **`sustainability_fund`**: Tracks contributions to the sustainability fund from collection payments.
-   **`platform_revenue`**: Tracks the revenue earned by the platform from collection payments.
-   **`content_categories`**: Organizes educational content into distinct categories.
-   **`educational_content`**: Stores articles and other educational materials.

## 2. Attributes

Attributes are the properties of each entity, which correspond to the columns in your tables. Below are the key attributes for each entity.

-   **`profiles`**: `id` (PK), `email` (UK), `role`, `status`. Contains role-specific attributes like `vehicle_type` (for collectors) and `center_name` (for recycling centers), which suggests an opportunity for normalization.
-   **`collection_requests`**: `id` (PK), `user_id` (FK), `collector_id` (FK), `status`, `items` (JSONB), `total_amount`, `payment_status`.
-   **`deliveries`**: `id` (PK), `collection_request_id` (FK), `collector_id` (FK), `recycling_center_id` (FK), `status`.
-   **`achievements`**: `id` (PK), `name`, `description`, `criteria` (JSONB).
-   **`user_achievements`**: `id` (PK), `user_id` (FK), `achievement_id` (FK).
-   **`feedback`**: `id` (PK), `user_id` (FK), `collection_request_id` (FK), `rating`, `message`.
-   **`support_tickets`**: `id` (PK), `user_id` (FK), `subject`, `category`, `status`.
-   **`pricing_categories`**: `id` (PK), `category_key` (UK), `name`, `price_per_item`.
-   **`collector_earnings`**: `id` (PK), `collector_id` (FK), `collection_request_id` (FK), `amount`, `status`.
-   **`payment_transactions`**: `id` (PK), `collection_request_id` (FK), `stripe_payment_intent_id`, `amount`, `status`.
-   **`notifications`**: `id` (PK), `user_id` (FK), `type`, `message`, `read`.
-   **`sustainability_fund`**: `id` (PK), `collection_request_id` (FK), `user_id` (FK), `amount`.
-   **`platform_revenue`**: `id` (PK), `collection_request_id` (FK), `amount`.
-   **`content_categories`**: `id` (PK), `slug` (UK), `name`.
-   **`educational_content`**: `id` (PK), `slug` (UK), `title`, `content`, `category_id` (FK), `author_id` (FK).

## 3. Relationships

Relationships define how entities are connected to each other, enforced by foreign keys.

-   **`profiles` and `collection_requests`**: One-to-Many. A profile can have many collection requests.
-   **`profiles` and `deliveries`**: One-to-Many. A profile (collector or recycling center) can be associated with many deliveries.
-   **`collection_requests` and `deliveries`**: One-to-One. Each collection request has exactly one delivery record.
-   **`profiles` and `user_achievements`**: One-to-Many. A user can have many achievements.
-   **`achievements` and `user_achievements`**: One-to-Many. An achievement can be earned by many users.
-   **`profiles` and `feedback` / `support_tickets` / `notifications`**: One-to-Many. A user can have many feedback entries, support tickets, and notifications.
-   **`collection_requests` and `feedback` / `collector_earnings` / `payment_transactions`**: One-to-Many. A collection request can be associated with feedback, earnings, and payment transactions.
-   **`content_categories` and `educational_content`**: One-to-Many. A category can contain many pieces of educational content.
-   **`profiles` and `educational_content`**: One-to-Many. A profile (author) can write many pieces of content.

## 4. Mermaid ERD Code

```mermaid
erDiagram
    profiles {
        uuid id PK
        string name
        string email UK
        string role
        string phone
        timestamp created_at
        text status
        text vehicle_type
        text license_number
        text coverage_area
        text availability
        text preferred_schedule
        text additional_info
        text center_name
        text address
        text operating_hours
        text[] accepted_materials
        text capacity
        text rejection_reason
        varchar collector_status
        text profile_picture_url
        date date_of_birth
        text district
        text area
        text default_pickup_address
        text account_status
        text bio
        timestamp updated_at
        int auto_id
        text password_hash
        timestamp last_login
        int login_attempts
        timestamp locked_until
        text registration_number
        numeric center_latitude
        numeric center_longitude
    }

    collection_requests {
        uuid id PK
        uuid user_id FK
        text status
        text[] item_types
        text quantities
        date preferred_date
        text preferred_time
        text address
        text contact_phone
        text special_instructions
        uuid collector_id FK
        uuid recycling_center_id FK
        timestamp created_at
        timestamp updated_at
        timestamp completed_at
        text priority
        date scheduled_date
        text scheduled_time
        text collector_notes
        text processing_status
        text recycling_notes
        uuid delivery_id FK
        text[] item_categories
        text[] item_photos
        text contact_person
        text pickup_floor
        text building_access_info
        jsonb items
        numeric total_amount
        text payment_method
        text payment_status
        text payment_intent_id
        text stripe_session_id
        numeric collector_commission
        boolean commission_paid
        timestamp commission_paid_at
        date original_scheduled_date
        text original_scheduled_time
        int reschedule_count
        text reschedule_reason
        timestamp last_rescheduled_at
        text[] collection_photos
        int photo_count
        timestamp photos_uploaded_at
        varchar currency
        numeric sustainability_fund_amount
        numeric platform_revenue
    }

    deliveries {
        uuid id PK
        uuid collection_request_id FK
        uuid collector_id FK
        uuid recycling_center_id FK
        text status
        timestamp delivered_at
        timestamp received_at
        timestamp processed_at
        text collector_notes
        text delivery_notes
        text processing_notes
        jsonb quality_assessment
        text[] delivery_photos
        text item_condition
        text contamination_level
        timestamp created_at
        timestamp updated_at
    }

    achievements {
        uuid id PK
        text name
        text description
        text icon
        text badge_color
        jsonb criteria
        int points
        boolean is_active
        timestamp created_at
    }

    user_achievements {
        uuid id PK
        uuid user_id FK
        uuid achievement_id FK
        timestamp earned_at
        jsonb progress
    }

    feedback {
        uuid id PK
        uuid user_id FK
        text feedback_type
        text subject
        text message
        int rating
        text status
        text admin_response
        uuid collection_request_id FK
        timestamp created_at
        timestamp updated_at
    }

    support_tickets {
        uuid id PK
        uuid user_id FK
        varchar name
        varchar email
        varchar subject
        varchar category
        varchar priority
        text message
        text status
        text admin_response
        timestamp responded_at
        timestamp created_at
        timestamp updated_at
    }

    pricing_categories {
        uuid id PK
        text category_key UK
        text name
        text description
        numeric price_per_item
        boolean is_active
        timestamp created_at
        timestamp updated_at
        varchar currency
    }

    collector_earnings {
        uuid id PK
        uuid collector_id FK
        uuid collection_request_id FK
        numeric amount
        text status
        timestamp paid_at
        timestamp created_at
        numeric commission_percentage
        varchar currency
    }

    payment_transactions {
        uuid id PK
        uuid collection_request_id FK
        text stripe_payment_intent_id
        text stripe_session_id
        numeric amount
        text currency
        text status
        text payment_method
        timestamp created_at
        timestamp updated_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        text type
        text title
        text message
        jsonb data
        boolean read
        text action_url
        uuid related_id
        timestamp created_at
        timestamp expires_at
    }

    sustainability_fund {
        uuid id PK
        uuid collection_request_id FK
        uuid user_id FK
        numeric amount
        varchar currency
        timestamp created_at
        text description
    }

    platform_revenue {
        uuid id PK
        uuid collection_request_id FK
        numeric amount
        varchar currency
        numeric percentage
        timestamp created_at
    }

    content_categories {
        uuid id PK
        text name
        text description
        text slug UK
        text icon
        int sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    educational_content {
        uuid id PK
        text title
        text slug UK
        text excerpt
        text content
        text featured_image_url
        uuid category_id FK
        uuid author_id FK
        text status
        int read_time_minutes
        int views_count
        boolean is_featured
        text[] tags
        text meta_description
        timestamp published_at
        timestamp created_at
        timestamp updated_at
    }

    profiles ||--o{ collection_requests : "requests"
    profiles ||--o{ collection_requests : "collects"
    profiles ||--o{ deliveries : "collects"
    profiles ||--o{ deliveries : "manages"
    profiles ||--o{ user_achievements : "earns"
    profiles ||--o{ feedback : "gives"
    profiles ||--o{ support_tickets : "creates"
    profiles ||--o{ collector_earnings : "earns"
    profiles ||--o{ notifications : "receives"
    profiles ||--o{ sustainability_fund : "contributes"
    profiles ||--o{ educational_content : "authors"

    collection_requests }o--|| deliveries : "has one"
    collection_requests ||--o{ feedback : "has"
    collection_requests ||--o{ collector_earnings : "generates"
    collection_requests ||--o{ payment_transactions : "has"
    collection_requests ||--o{ sustainability_fund : "funds"
    collection_requests ||--o{ platform_revenue : "generates"

    achievements ||--o{ user_achievements : "is earned"
    content_categories ||--o{ educational_content : "contains"
``` 