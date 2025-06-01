-- Create notification templates table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification settings table
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    phone_number TEXT,
    alert_levels TEXT[] DEFAULT ARRAY['critical', 'warning'],
    notification_types TEXT[] DEFAULT ARRAY['weather', 'task', 'shift'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    template_id UUID REFERENCES notification_templates(id),
    type TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_templates
CREATE POLICY "Notification templates are viewable by all authenticated users"
    ON notification_templates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only coordinators can manage notification templates"
    ON notification_templates FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Create policies for notification_settings
CREATE POLICY "Users can view their own notification settings"
    ON notification_settings FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings"
    ON notification_settings FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Only coordinators can create notifications"
    ON notifications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Insert default notification templates
INSERT INTO notification_templates (type, subject, body) VALUES
    ('weather_critical', 'Critical Weather Alert', 'A critical weather condition has been detected: {{message}}. Please take immediate action: {{action_required}}.'),
    ('weather_warning', 'Weather Warning', 'A weather warning has been issued: {{message}}. Recommended action: {{action_required}}.'),
    ('weather_caution', 'Weather Caution', 'A weather caution has been issued: {{message}}. Please be aware: {{action_required}}.'),
    ('weather_alert_resolved', 'Weather Alert Resolved', 'The weather alert has been resolved: {{message}}. Thank you for your attention.');

-- Create function to handle weather notifications
CREATE OR REPLACE FUNCTION handle_weather_notifications()
RETURNS TRIGGER AS $$
DECLARE
    template_record RECORD;
    settings_record RECORD;
    notification_record RECORD;
BEGIN
    -- Get the appropriate template based on alert level
    SELECT * INTO template_record
    FROM notification_templates
    WHERE type = CASE
        WHEN NEW.severity = 'critical' THEN 'weather_critical'
        WHEN NEW.severity = 'high' THEN 'weather_warning'
        ELSE 'weather_caution'
    END;

    -- Get notification settings for all users
    FOR settings_record IN
        SELECT * FROM notification_settings
        WHERE alert_levels @> ARRAY[NEW.severity]
    LOOP
        -- Create notification record
        INSERT INTO notifications (
            user_id,
            template_id,
            type,
            subject,
            body,
            sent_at
        ) VALUES (
            settings_record.user_id,
            template_record.id,
            'weather',
            template_record.subject,
            REPLACE(
                REPLACE(
                    template_record.body,
                    '{{message}}',
                    NEW.message
                ),
                '{{action_required}}',
                NEW.action_required
            ),
            NOW()
        ) RETURNING * INTO notification_record;

        -- Send email if enabled
        IF settings_record.email_enabled THEN
            -- Note: Email sending will be handled by the application
            -- This is just a placeholder for the database trigger
            PERFORM pg_notify(
                'weather_notification',
                json_build_object(
                    'notification_id', notification_record.id,
                    'user_id', settings_record.user_id,
                    'type', 'email'
                )::text
            );
        END IF;

        -- Send SMS if enabled
        IF settings_record.sms_enabled AND settings_record.phone_number IS NOT NULL THEN
            -- Note: SMS sending will be handled by the application
            -- This is just a placeholder for the database trigger
            PERFORM pg_notify(
                'weather_notification',
                json_build_object(
                    'notification_id', notification_record.id,
                    'user_id', settings_record.user_id,
                    'type', 'sms',
                    'phone_number', settings_record.phone_number
                )::text
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for weather notifications
CREATE TRIGGER weather_notification_trigger
    AFTER INSERT ON weather_alerts
    FOR EACH ROW
    EXECUTE FUNCTION handle_weather_notifications();

-- Create function to handle alert resolution notifications
CREATE OR REPLACE FUNCTION handle_alert_resolution_notifications()
RETURNS TRIGGER AS $$
DECLARE
    template_record RECORD;
    settings_record RECORD;
    notification_record RECORD;
BEGIN
    -- Only send resolution notifications if the alert was previously active
    IF OLD.resolved_at IS NULL AND NEW.resolved_at IS NOT NULL THEN
        -- Get the resolution template
        SELECT * INTO template_record
        FROM notification_templates
        WHERE type = 'weather_alert_resolved';

        -- Get notification settings for all users who received the original alert
        FOR settings_record IN
            SELECT DISTINCT ns.*
            FROM notification_settings ns
            JOIN notifications n ON n.user_id = ns.user_id
            WHERE n.template_id IN (
                SELECT id FROM notification_templates
                WHERE type LIKE 'weather_%'
            )
        LOOP
            -- Create notification record
            INSERT INTO notifications (
                user_id,
                template_id,
                type,
                subject,
                body,
                sent_at
            ) VALUES (
                settings_record.user_id,
                template_record.id,
                'weather',
                template_record.subject,
                REPLACE(
                    REPLACE(
                        template_record.body,
                        '{{message}}',
                        NEW.message
                    ),
                    '{{action_required}}',
                    'Alert has been resolved'
                ),
                NOW()
            ) RETURNING * INTO notification_record;

            -- Send email if enabled
            IF settings_record.email_enabled THEN
                PERFORM pg_notify(
                    'weather_notification',
                    json_build_object(
                        'notification_id', notification_record.id,
                        'user_id', settings_record.user_id,
                        'type', 'email'
                    )::text
                );
            END IF;

            -- Send SMS if enabled
            IF settings_record.sms_enabled AND settings_record.phone_number IS NOT NULL THEN
                PERFORM pg_notify(
                    'weather_notification',
                    json_build_object(
                        'notification_id', notification_record.id,
                        'user_id', settings_record.user_id,
                        'type', 'sms',
                        'phone_number', settings_record.phone_number
                    )::text
                );
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for alert resolution notifications
CREATE TRIGGER weather_alert_resolution_trigger
    AFTER UPDATE ON weather_alerts
    FOR EACH ROW
    EXECUTE FUNCTION handle_alert_resolution_notifications(); 