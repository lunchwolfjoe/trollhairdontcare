-- Create weather conditions table
CREATE TABLE weather_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL,
    temperature DECIMAL,
    humidity INTEGER,
    wind_speed DECIMAL,
    wind_direction TEXT,
    precipitation DECIMAL,
    conditions TEXT,
    alert_level TEXT CHECK (alert_level IN ('normal', 'caution', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create weather alerts table
CREATE TABLE weather_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condition_id UUID REFERENCES weather_conditions(id),
    alert_type TEXT CHECK (alert_type IN ('rain', 'wind', 'heat', 'cold', 'storm')),
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    action_required TEXT,
    affected_areas TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Create weather monitoring settings table
CREATE TABLE weather_monitoring_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    temperature_threshold_min DECIMAL,
    temperature_threshold_max DECIMAL,
    wind_speed_threshold DECIMAL,
    precipitation_threshold DECIMAL,
    humidity_threshold_max INTEGER,
    alert_notification_enabled BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE weather_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_monitoring_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for weather_conditions
CREATE POLICY "Weather conditions are viewable by all authenticated users"
    ON weather_conditions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only coordinators can insert weather conditions"
    ON weather_conditions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Create policies for weather_alerts
CREATE POLICY "Weather alerts are viewable by all authenticated users"
    ON weather_alerts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only coordinators can create weather alerts"
    ON weather_alerts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

CREATE POLICY "Only coordinators can resolve weather alerts"
    ON weather_alerts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Create policies for weather_monitoring_settings
CREATE POLICY "Weather monitoring settings are viewable by all authenticated users"
    ON weather_monitoring_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only coordinators can manage weather monitoring settings"
    ON weather_monitoring_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Create function to handle weather alerts
CREATE OR REPLACE FUNCTION handle_weather_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if conditions exceed thresholds
    IF EXISTS (
        SELECT 1 FROM weather_monitoring_settings
        WHERE temperature_threshold_min IS NOT NULL
        AND NEW.temperature < temperature_threshold_min
    ) THEN
        INSERT INTO weather_alerts (
            condition_id,
            alert_type,
            severity,
            message,
            action_required,
            affected_areas
        ) VALUES (
            NEW.id,
            'cold',
            CASE
                WHEN NEW.temperature < temperature_threshold_min - 10 THEN 'critical'
                WHEN NEW.temperature < temperature_threshold_min - 5 THEN 'high'
                ELSE 'medium'
            END,
            'Temperature below threshold: ' || NEW.temperature || '°C',
            'Ensure volunteers have appropriate cold weather gear',
            ARRAY['all']
        );
    END IF;

    -- Add similar checks for other weather conditions
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for weather alerts
CREATE TRIGGER weather_alert_trigger
    AFTER INSERT ON weather_conditions
    FOR EACH ROW
    EXECUTE FUNCTION handle_weather_alert();

-- Insert default monitoring settings
INSERT INTO weather_monitoring_settings (
    temperature_threshold_min,
    temperature_threshold_max,
    wind_speed_threshold,
    precipitation_threshold,
    humidity_threshold_max,
    created_by
) VALUES (
    10,  -- Minimum temperature (°C)
    35,  -- Maximum temperature (°C)
    30,  -- Wind speed threshold (km/h)
    5,   -- Precipitation threshold (mm)
    85,  -- Maximum humidity (%)
    (SELECT id FROM auth.users WHERE role = 'coordinator' LIMIT 1)
); 