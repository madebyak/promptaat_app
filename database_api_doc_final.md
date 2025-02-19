
# Database Schema and API Documentation

## 1. Database Schema

### 1.1 Categories
Stores main and subcategories.

| Column             | Type         | Description                           |
|--------------------|-------------|---------------------------------------|
| id                | INT (PK)     | Unique identifier                     |
| name_en           | VARCHAR(255) | Category name (English)               |
| name_ar           | VARCHAR(255) | Category name (Arabic)                |
| slug              | VARCHAR(255) | URL-friendly category name            |
| parent_category_id | INT (FK) NULL | Links to parent category if subcategory |
| description       | TEXT NULL    | Optional category description         |
| order            | INT DEFAULT 0 | Sorting order (lower numbers appear first) |
| created_at        | TIMESTAMP    | Creation timestamp                     |
| updated_at        | TIMESTAMP    | Last update timestamp                  |

### 1.2 Tools
Stores AI tool details.

| Column     | Type         | Description                   |
|-----------|-------------|-------------------------------|
| id        | INT (PK)     | Unique identifier             |
| name_en   | VARCHAR(255) | Tool name in English          |
| icon_url  | VARCHAR(255) | Tool logo URL                 |
| created_at| TIMESTAMP    | Creation timestamp            |
| updated_at| TIMESTAMP    | Last update timestamp         |

### 1.3 Prompts
Stores details of prompts.

| Column             | Type         | Description                          |
|--------------------|-------------|--------------------------------------|
| id                | INT (PK)     | Unique identifier                    |
| title_en          | VARCHAR(255) | Prompt title (English)               |
| title_ar          | VARCHAR(255) | Prompt title (Arabic)                |
| type              | ENUM('Free', 'Pro') | Free or Pro prompt |
| description_en    | TEXT         | Description in English               |
| description_ar    | TEXT         | Description in Arabic                |
| instructions_en   | TEXT         | Instructions in English              |
| instructions_ar   | TEXT         | Instructions in Arabic               |
| uses_counter      | INT DEFAULT 0 | Count of times copied                |
| created_at        | TIMESTAMP    | Creation timestamp                    |
| updated_at        | TIMESTAMP    | Last update timestamp                 |

#### Many-to-Many Relationships
- **Prompt Categories (`prompt_categories`)**
  - `prompt_id (FK)` ↔ `category_id (FK)`
- **Prompt Tools (`prompt_tools`)**
  - `prompt_id (FK)` ↔ `tool_id (FK)`

### 1.4 Users (Website Users)
Stores registered users.

| Column       | Type         | Description                |
|-------------|-------------|----------------------------|
| id          | INT (PK)     | Unique identifier          |
| first_name  | VARCHAR(100) | User's first name         |
| last_name   | VARCHAR(100) | User's last name          |
| email       | VARCHAR(255) | User's email (unique)     |
| password    | VARCHAR(255) | Hashed password          |
| country     | VARCHAR(100) | User's country           |
| email_verified | BOOLEAN  | Email verification status |
| created_at  | TIMESTAMP    | Creation timestamp        |
| updated_at  | TIMESTAMP    | Last update timestamp     |

### 1.5 Pro Memberships (Subscriptions)
Stores active and expired Pro subscriptions.

| Column         | Type         | Description                                |
|---------------|-------------|--------------------------------------------|
| id            | INT (PK)     | Unique subscription ID                     |
| user_id       | INT (FK)     | Links to `users` table                     |
| plan_name     | ENUM('1_month', '3_months', '12_months') | Subscription duration |
| status        | ENUM('active', 'expired') | Tracks subscription status |
| start_date    | TIMESTAMP    | When the subscription started              |
| end_date      | TIMESTAMP    | When it expires (system auto-reverts user) |
| created_at    | TIMESTAMP    | When the subscription was created          |
| updated_at    | TIMESTAMP    | Last update timestamp                      |

### 1.6 Admin Users (CMS Access)
Stores credentials for CMS admins (no public registration).

| Column      | Type         | Description                |
|------------|-------------|----------------------------|
| id         | INT (PK)     | Unique identifier          |
| username   | VARCHAR(255) | Admin username            |
| password   | VARCHAR(255) | Hashed password           |
| created_at | TIMESTAMP    | Creation timestamp        |
| updated_at | TIMESTAMP    | Last update timestamp     |

### 1.7 User Catalogs (Saved Prompts)
Users can save prompts into custom catalogs.

| Column    | Type         | Description                |
|----------|-------------|----------------------------|
| id       | INT (PK)     | Unique identifier          |
| user_id  | INT (FK)     | Reference to users table  |
| name     | VARCHAR(255) | Catalog name               |
| created_at | TIMESTAMP  | Creation timestamp         |
| updated_at | TIMESTAMP  | Last update timestamp      |

**Saved Prompts Relationship (`saved_prompts`)**
- `user_catalog_id (FK)` ↔ `prompt_id (FK)`

### 1.8 Password Reset Tokens
Handles password resets.

| Column     | Type         | Description                    |
|-----------|-------------|--------------------------------|
| id        | INT (PK)     | Unique identifier              |
| user_id   | INT (FK)     | Reference to users table       |
| token     | VARCHAR(255) | Unique reset token             |
| expires_at| TIMESTAMP    | Expiration timestamp           |
| created_at| TIMESTAMP    | Creation timestamp            |

---



