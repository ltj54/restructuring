alter table insurance_request
    add column if not exists status varchar(30),
    add column if not exists submitted_at timestamp,
    add column if not exists xml_content text;

update insurance_request
set status = 'SENT'
where status is null;

alter table insurance_request
    alter column status set not null;
