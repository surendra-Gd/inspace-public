-- Table: streak
create table streak (
    id bigint not null,
    count int not null,
    time_stamp date,
    member_id bigint not null,
    primary key (id)
);

--Table: notification_token
create table notification_token (
    token_id bigint not null,
    device_token varchar(512) not null,
    user_id bigint not null,
    is_expired boolean default false not null,
    created_at timestamp(6),
    last_updated_at timestamp(6),
    primary key (token_id)
);

--Table: post_comment
create table post_comment (
    comment_id bigint not null,
    post bigint not null,
    parent_id bigint,
    member_id bigint not null,
    space_id bigint not null,
    payload varchar(720) not null,
    prefixes varchar(300),
    reply_count int,
    commented_on timestamp(6),
    last_updated_on timestamp(6),
    comment_type varchar(255) check (comment_type in ('COMMENT','REPLY')),
    primary key (comment_id)
);

-- Table: text
create table text (
    text_id bigint not null,
    text varchar(720) not null,
    member_id bigint not null,
    tagged varchar(1000),
    space_id bigint not null,
    created_on timestamp(6),
    is_anonymous boolean not null default false,
    messages_count bigint default 0,
    likes_count bigint default 0,
    last_updated_on timestamp(6),
    primary key (text_id)
);

-- Table: text_like
create table text_like (
    like_id bigint not null,
    text bigint not null,
    member_id bigint not null,
    space_id bigint not null,
    primary key (like_id)
);


--Table: text_message
create table text_message (
    id bigint not null,
    text bigint not null,
    message varchar(720) not null,
    time_stamp timestamp(6),
    type varchar(255) check (type in ('MESSAGE','REPLY')),
    prefixes varchar(255),
    member_id bigint not null,
    space_id bigint not null,
    primary key (id)
);

-- Add the new column 'target_user_seen' to the 'friend_request' table
alter table friend_request
    add column target_user_seen boolean default false;

alter table space_member
    add column total_streak int default 10,
    add column last_streak_modified date default current_date,
    add column last_streak int default 10;

-- Add the new column 'admin_seen' to the 'space_request' table
alter table space_request
    add column admin_seen boolean default false;

-- Create sequences for auto-incrementing primary keys
create sequence "streak-seq" start with 1 increment by 1;
create sequence "notification_token-seq" start with 1 increment by 1;
create sequence "post-comment-seq" start with 1 increment by 1;
create sequence "text-seq" start with 1 increment by 1;
create sequence "text_like-seq" start with 1 increment by 1;
create sequence "text_message-seq" start with 1 increment by 1;


alter table streak
    add constraint fk_streak_member foreign key(member_id) references space_member(member_id);

-- Ensure the `post_comment` table has a foreign key constraint to the `post` table
alter table post_comment
    add constraint fk_comment_post foreign key(post) references post(post_id);

alter table post_comment
    add constraint fk_comment_parent foreign key(parent_id) references post_comment(comment_id);

alter table text_message
    add constraint fk_tm_text foreign key(text) references text(text_id);

alter table text_like
    add constraint fk_tl_text foreign key(text) references text(text_id);