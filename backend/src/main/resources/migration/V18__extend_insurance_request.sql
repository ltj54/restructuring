alter table insurance_request
    add column if not exists first_name varchar(100),
    add column if not exists last_name varchar(100),
    add column if not exists ssn varchar(20),
    add column if not exists phone varchar(30),
    add column if not exists source varchar(30),
    add column if not exists products varchar(255),
    add column if not exists generated_text text;
