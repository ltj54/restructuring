create table insurance_request (
    id bigint generated always as identity primary key,
    user_id bigint not null,
    first_name varchar(100),
    last_name varchar(100),
    ssn varchar(20),
    phone varchar(30),

    source varchar(30),
    products varchar(255),
    generated_text text,

    created_at timestamp not null default now()
);
