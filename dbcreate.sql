CREATE TYPE sensor_mode AS ENUM('red', 'blue', 'none');

CREATE TABLE iotapp_lightlevels(
    id serial PRIMARY KEY,
    measurement_id INT,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP not null,
    sensor_reading real not null,
    sensor_filter_mode sensor_mode
);
