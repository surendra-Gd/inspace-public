-- Table: _user
create table _user (
    user_id bigint not null,
    account_locked boolean not null default true,
    email varchar(255) not null,
    enabled boolean not null default false,
    name varchar(255),
    object_key varchar(255) not null default 'default_user_avatar.png',
    password varchar(255),
    profile_url varchar(255),
    role varchar(255) check (role in ('USER','ADMIN')),
    status varchar(255),
    username varchar(255) not null,
    primary key (user_id)
);

-- Table: activity
create table activity (
    id bigint not null,
    prompt varchar(255) check (prompt in ('JOINED','LEFT','REMOVE','SHIFT_ADMIN')),
    space_id bigint not null,
    time_stamp timestamp(6),
    _user bigint,
    primary key (id)
);


-- Table: confirmation_token
create table confirmation_token (
    id bigint not null,
    created_at timestamp(6) not null,
    expires_at timestamp(6) not null,
    revoked boolean not null default false,
    send_email varchar(255),
    token varchar(255) not null,
    validated boolean not null default false,
    user_id bigint not null,
    primary key (id)
);

-- Table: emoji
create table emoji (
    id bigint not null,
    emojis varchar(255) check (emojis in ('LOVE','SMILE','LAUGH_TEAR','LIKE','SLEEPY')),
    member_id bigint,
    post bigint not null,
    primary key (id)
);

-- Table: friend
create table friend (
    friends_id bigint not null,
    user1 bigint,
    user2 bigint,
    primary key (friends_id)
);

-- Table: friend_request
create table friend_request (
    request_id bigint not null,
    request_on timestamp(6),
    status varchar(255) check (status in ('PROCESS','ACCEPT','DECLINE')),
    request_to bigint not null,
    requester bigint not null,
    primary key (request_id)
);

-- Table: post
create table post (
    post_id bigint not null,
    expired_on timestamp(6) with time zone,
    expression varchar(255),
    generated_on timestamp(6) with time zone,
    height integer,
    image_key varchar(255),
    member_id bigint not null,
    shared_on timestamp(6),
    space_id bigint not null,
    url varchar(2000),
    version_id varchar(255),
    width integer,
    primary key (post_id)
);

-- Table: space
create table space (
    space_id bigint not null,
    registered_on date,
    spacename varchar(255) not null,
    unique_id varchar(255) not null,
    admin bigint,
    primary key (space_id)
);

-- Table: space_member
create table space_member (
    member_id bigint not null,
    joined_on date,
    member_status varchar(255) check (member_status in ('ACTIVE','REMOVED')),
    member_type varchar(255) check (member_type in ('MANAGER','MEMBER')),
    member bigint not null,
    space bigint not null,
    primary key (member_id)
);

-- Table: space_request
create table space_request (
    request_id bigint not null,
    requested_on timestamp(6),
    status varchar(255) check (status in ('PROCESS','ACCEPT','DECLINE')),
    request_by bigint not null,
    space bigint not null,
    primary key (request_id)
);

-- Table: token
create table token (
    id bigint not null,
    access_token varchar(255),
    expired boolean not null,
    refresh_token varchar(255),
    revoked boolean not null,
    token_type varchar(255) check (token_type in ('BEARER')),
    _user bigint,
    primary key (id)
);



-- Unique constraint to prevent duplicate username in _user
alter table if exists _user
    add constraint unique_username unique (username);

-- Unique constraint to prevent duplicate email in _user
alter table if exists _user
    add constraint unique_email unique (email);


create index idx_username on _user (username);


-- Unique constraint to prevent duplicate friend pairs in friend
alter table friend
    add constraint unique_friend_pair unique (user1, user2);

-- Unique constraint to prevent duplicate image_key in post
alter table post
    add constraint unique_image_key unique (image_key);


-- Unique constraint to prevent duplicate unique_id in space
alter table space
    add constraint unique_space_unique_id unique(unique_id);

create index idx_unique_id on space (unique_id);

-- Unique constraint to prevent duplicate space and member pair
alter table space_member
    add constraint unique_space_member unique (space, member);


-- Create sequences for auto-incrementing primary keys
create sequence "activity-seq" start with 1 increment by 1;
create sequence "confirmation-token-seq" start with 1 increment by 1;
create sequence "emoji-seq" start with 1 increment by 1;
create sequence "friend-seq" start with 1 increment by 1;
create sequence "friend-request-seq" start with 1 increment by 1;
create sequence "member-seq" start with 1 increment by 1;
create sequence "post-seq" start with 1 increment by 1;
create sequence "space-request-seq" start with 1 increment by 1;
create sequence "space-seq" start with 1 increment by 1;
create sequence "token-seq" start with 1 increment by 1;
create sequence "user-seq" start with 1 increment by 1;

-- Foreign key constraint linking to the _user table
alter table activity
    add constraint fk_activity_user foreign key (_user) references _user(user_id);

-- Foreign key constraint linking to the User table
alter table confirmation_token
    add constraint fk_confirmation_token_user foreign key (user_id) references _user(user_id);

-- Foreign key constraint linking to the Post table
alter table emoji
    add constraint fk_emoji_post foreign key (post) references post(post_id);


-- Foreign key constraints linking to the User table
alter table friend
    add constraint fk_friend_user1 foreign key (user1) references _user(user_id);

alter table friend
    add constraint fk_friend_user2 foreign key (user2) references _user(user_id);

-- Foreign key constraints linking to the User table
alter table friend_request
    add constraint fk_friend_request_requester foreign key (requester) references _user(user_id);

alter table friend_request
    add constraint fk_friend_request_request_to foreign key (request_to) references _user(user_id);

-- Add the foreign key constraint for admin
alter table space
    add constraint fk_space_admin foreign key (admin) references _user(user_id);

-- Add the foreign key constraint for space
alter table space_member
    add constraint fk_space_member_space foreign key (space) references space(space_id);

-- Add the foreign key constraint for member
alter table space_member
    add constraint fk_space_member_user foreign key (member) references _user(user_id);

-- Add the foreign key constraint for space
alter table space_request
    add constraint fk_space_request_space foreign key (space) references space(space_id);

-- Add the foreign key constraint for requested_by
alter table space_request
    add constraint fk_space_request_user foreign key (request_by) references _user(user_id);

-- Add the foreign key constraint for user
alter table token
    add constraint fk_token_user foreign key (_user) references _user(user_id);
