create table "user" (
	id serial primary key,
	name varchar(128) not null,
	password varchar(128) not null,
	email varchar(512),
	created timestamp default current_timestamp
);

create table folder (
	id serial primary key,
	title varchar(512) not null,
	"user" int references "user",
	colour varchar(7)
);

create table "note" (
	id serial primary key,
	title varchar(512) not null,
	"user" int references "user",
	content text,
	folder int references folder
);