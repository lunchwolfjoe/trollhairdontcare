-- Create weather forecast table
CREATE TABLE weather_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL,
    forecast_time TIMESTAMPTZ NOT NULL,
    temperature DECIMAL,
    humidity INTEGER,
    wind_speed DECIMAL,
    wind_direction TEXT,
    precipitation DECIMAL,
    conditions TEXT,
    alert_level TEXT CHECK (alert_level IN ('normal', 'caution', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create weather forecast settings table
CREATE TABLE weather_forecast_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key TEXT NOT NULL,
    location_lat DECIMAL NOT NULL,
    location_lon DECIMAL NOT NULL,
    update_interval INTEGER DEFAULT 3600, -- in seconds
    last_updated TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE weather_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_forecast_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for weather_forecasts
CREATE POLICY "Weather forecasts are viewable by all authenticated users"
    ON weather_forecasts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only coordinators can insert weather forecasts"
    ON weather_forecasts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Create policies for weather_forecast_settings
CREATE POLICY "Weather forecast settings are viewable by all authenticated users"
    ON weather_forecast_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Only coordinators can manage weather forecast settings"
    ON weather_forecast_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role = 'coordinator'
        )
    );

-- Create function to update weather forecasts
CREATE OR REPLACE FUNCTION update_weather_forecasts()
RETURNS void AS $$
DECLARE
    settings_record RECORD;
    api_key TEXT;
    lat DECIMAL;
    lon DECIMAL;
BEGIN
    -- Get the latest settings
    SELECT * INTO settings_record
    FROM weather_forecast_settings
    ORDER BY updated_at DESC
    LIMIT 1;

    IF settings_record IS NULL THEN
        RAISE NOTICE 'No weather forecast settings found';
        RETURN;
    END IF;

    -- Call OpenWeatherMap API and insert forecast data
    -- Note: This is a placeholder. The actual API call will be handled by the application
    -- This function will be called by a scheduled job
    INSERT INTO weather_forecasts (
        timestamp,
        forecast_time,
        temperature,
        humidity,
        wind_speed,
        wind_direction,
        precipitation,
        conditions,
        alert_level
    ) VALUES (
        NOW(),
        NOW() + INTERVAL '1 hour',
        20.5,
        65,
        15.2,
        'NW',
        0,
        'Partly cloudy',
        'normal'
    );
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to update forecasts
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'update-weather-forecasts',
    '0 * * * *', -- Run every hour
    $$
    SELECT update_weather_forecasts();
    $$
); 