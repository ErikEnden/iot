CREATE TABLE iotapp_lightlevels(
    id serial PRIMARY KEY,
    time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP not null,
    sensor_reading real not null
);