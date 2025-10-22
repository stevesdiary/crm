-- Add new columns to tasks table
ALTER TABLE tasks 
ADD COLUMN status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN priority VARCHAR(50) DEFAULT 'medium',
ADD COLUMN assigned_by VARCHAR(255),
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create reminders table
CREATE TABLE reminders (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    task_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'email',
    time TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add foreign key for assigned_by in tasks
ALTER TABLE tasks 
ADD CONSTRAINT fk_tasks_assigned_by 
FOREIGN KEY (assigned_by) REFERENCES users(id);

-- Create indexes for better performance
CREATE INDEX idx_reminders_tenant_id ON reminders(tenant_id);
CREATE INDEX idx_reminders_task_id ON reminders(task_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_time_sent ON reminders(time, sent);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_assigned_by ON tasks(assigned_by);

-- Add SLA tracking columns to tickets
ALTER TABLE tickets 
ADD COLUMN sla_breached BOOLEAN DEFAULT FALSE,
ADD COLUMN response_time INTEGER,
ADD COLUMN resolution_time INTEGER,
ADD COLUMN first_response_at TIMESTAMP,
ADD COLUMN resolved_at TIMESTAMP,
ADD COLUMN due_at TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create SLA policies table
CREATE TABLE sla_policies (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    priority VARCHAR(50) UNIQUE NOT NULL,
    response_time INTEGER NOT NULL,
    resolution_time INTEGER NOT NULL,
    business_hours_only BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Create indexes for SLA tracking
CREATE INDEX idx_tickets_sla_breached ON tickets(sla_breached);
CREATE INDEX idx_tickets_due_at ON tickets(due_at);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_sla_policies_tenant_priority ON sla_policies(tenant_id, priority);

-- Insert default SLA policies
INSERT INTO sla_policies (id, tenant_id, priority, response_time, resolution_time) 
SELECT 
    CONCAT('sla_', id, '_critical'), id, 'critical', 15, 240
FROM tenants;

INSERT INTO sla_policies (id, tenant_id, priority, response_time, resolution_time) 
SELECT 
    CONCAT('sla_', id, '_high'), id, 'high', 60, 480
FROM tenants;

INSERT INTO sla_policies (id, tenant_id, priority, response_time, resolution_time) 
SELECT 
    CONCAT('sla_', id, '_medium'), id, 'medium', 240, 1440
FROM tenants;

INSERT INTO sla_policies (id, tenant_id, priority, response_time, resolution_time) 
SELECT 
    CONCAT('sla_', id, '_low'), id, 'low', 480, 2880
FROM tenants;

-- Create communications table
CREATE TABLE communications (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    contact_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    direction VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT,
    duration INTEGER,
    status VARCHAR(50) DEFAULT 'completed',
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for communications
CREATE INDEX idx_communications_tenant_id ON communications(tenant_id);
CREATE INDEX idx_communications_contact_id ON communications(contact_id);
CREATE INDEX idx_communications_user_id ON communications(user_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_created_at ON communications(created_at);

-- Create documents table
CREATE TABLE documents (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    version INTEGER DEFAULT 1,
    parent_id VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    FOREIGN KEY (parent_id) REFERENCES documents(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Create indexes for documents
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_parent_id ON documents(parent_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- Create webhooks table
CREATE TABLE webhooks (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Create webhook deliveries table
CREATE TABLE webhook_deliveries (
    id VARCHAR(255) PRIMARY KEY,
    webhook_id VARCHAR(255) NOT NULL,
    event VARCHAR(100) NOT NULL,
    payload JSON NOT NULL,
    response JSON,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

-- Create integrations table
CREATE TABLE integrations (
    id VARCHAR(255) PRIMARY KEY,
    tenant_id VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    config JSON,
    credentials JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Create indexes for webhooks and integrations
CREATE INDEX idx_webhooks_tenant_id ON webhooks(tenant_id);
CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_integrations_tenant_id ON integrations(tenant_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);