--
-- PostgreSQL database dump
--

\restrict yw6wGnZvqWlINTrI7FqXQ7dBe7ZJzqOk8i2DjZ98MzlpuRK96ok0cyS2HCsQFcn

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: MissionType; Type: TYPE; Schema: public; Owner: infinityadmin
--

CREATE TYPE public."MissionType" AS ENUM (
    'DAILY',
    'CHALLENGE'
);


ALTER TYPE public."MissionType" OWNER TO infinityadmin;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: infinityadmin
--

CREATE TYPE public."NotificationType" AS ENUM (
    'SYSTEM',
    'MISSION_COMPLETED',
    'LEVEL_UP',
    'ROUTINE_REMINDER'
);


ALTER TYPE public."NotificationType" OWNER TO infinityadmin;

--
-- Name: PointType; Type: TYPE; Schema: public; Owner: infinityadmin
--

CREATE TYPE public."PointType" AS ENUM (
    'MISSION',
    'OTHER'
);


ALTER TYPE public."PointType" OWNER TO infinityadmin;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: infinityadmin
--

CREATE TYPE public."Role" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public."Role" OWNER TO infinityadmin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: daily_goals; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.daily_goals (
    goal_id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    goal_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.daily_goals OWNER TO infinityadmin;

--
-- Name: daily_goals_goal_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.daily_goals_goal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_goals_goal_id_seq OWNER TO infinityadmin;

--
-- Name: daily_goals_goal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.daily_goals_goal_id_seq OWNED BY public.daily_goals.goal_id;


--
-- Name: exercise_categories; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.exercise_categories (
    category_id integer NOT NULL,
    category_name text NOT NULL,
    icon_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.exercise_categories OWNER TO infinityadmin;

--
-- Name: exercise_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.exercise_categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_categories_category_id_seq OWNER TO infinityadmin;

--
-- Name: exercise_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.exercise_categories_category_id_seq OWNED BY public.exercise_categories.category_id;


--
-- Name: exercise_videos; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.exercise_videos (
    video_id integer NOT NULL,
    category_id integer NOT NULL,
    video_title text NOT NULL,
    video_url text,
    video_thumbnail text,
    difficulty_level text NOT NULL,
    body_part text,
    duration_minutes integer,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.exercise_videos OWNER TO infinityadmin;

--
-- Name: exercise_videos_video_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.exercise_videos_video_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exercise_videos_video_id_seq OWNER TO infinityadmin;

--
-- Name: exercise_videos_video_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.exercise_videos_video_id_seq OWNED BY public.exercise_videos.video_id;


--
-- Name: health_tracking; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.health_tracking (
    tracking_id integer NOT NULL,
    user_id integer NOT NULL,
    tracking_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    weight double precision,
    height double precision,
    water integer,
    sleep_hours double precision,
    steps_count integer
);


ALTER TABLE public.health_tracking OWNER TO infinityadmin;

--
-- Name: health_tracking_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.health_tracking_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.health_tracking_tracking_id_seq OWNER TO infinityadmin;

--
-- Name: health_tracking_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.health_tracking_tracking_id_seq OWNED BY public.health_tracking.tracking_id;


--
-- Name: levels; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.levels (
    level_id integer NOT NULL,
    level_number integer NOT NULL,
    level_name text NOT NULL,
    title_th text,
    color text,
    hex_code text,
    min_exp integer NOT NULL,
    max_exp integer NOT NULL
);


ALTER TABLE public.levels OWNER TO infinityadmin;

--
-- Name: levels_level_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.levels_level_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.levels_level_id_seq OWNER TO infinityadmin;

--
-- Name: levels_level_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.levels_level_id_seq OWNED BY public.levels.level_id;


--
-- Name: missions; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.missions (
    mission_id integer NOT NULL,
    mission_name text NOT NULL,
    mission_type public."MissionType" NOT NULL,
    required_level integer NOT NULL,
    reward_exp integer NOT NULL,
    reward_points integer NOT NULL,
    target_value integer NOT NULL,
    target_unit text NOT NULL,
    duration_days integer,
    description text,
    start_time text,
    end_time text,
    is_active boolean DEFAULT true NOT NULL,
    presets jsonb
);


ALTER TABLE public.missions OWNER TO infinityadmin;

--
-- Name: missions_mission_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.missions_mission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.missions_mission_id_seq OWNER TO infinityadmin;

--
-- Name: missions_mission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.missions_mission_id_seq OWNED BY public.missions.mission_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    is_sent boolean DEFAULT false NOT NULL,
    noti_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reference_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO infinityadmin;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO infinityadmin;

--
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- Name: point_history; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.point_history (
    history_id integer NOT NULL,
    user_id integer NOT NULL,
    mission_id integer,
    points_earned integer NOT NULL,
    point_type public."PointType" NOT NULL,
    earned_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.point_history OWNER TO infinityadmin;

--
-- Name: point_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.point_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.point_history_history_id_seq OWNER TO infinityadmin;

--
-- Name: point_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.point_history_history_id_seq OWNED BY public.point_history.history_id;


--
-- Name: routines; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.routines (
    routine_id integer NOT NULL,
    user_id integer NOT NULL,
    title text NOT NULL,
    scheduled_time text NOT NULL,
    scheduled_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed boolean DEFAULT false NOT NULL,
    notifications boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.routines OWNER TO infinityadmin;

--
-- Name: routines_routine_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.routines_routine_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.routines_routine_id_seq OWNER TO infinityadmin;

--
-- Name: routines_routine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.routines_routine_id_seq OWNED BY public.routines.routine_id;


--
-- Name: user_missions; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.user_missions (
    user_mission_id integer NOT NULL,
    user_id integer NOT NULL,
    mission_id integer NOT NULL,
    start_date date,
    end_date date,
    current_progress integer DEFAULT 0 NOT NULL,
    status boolean DEFAULT false NOT NULL,
    completed_at timestamp(3) without time zone,
    is_claimed boolean DEFAULT false NOT NULL,
    claimed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_missions OWNER TO infinityadmin;

--
-- Name: user_missions_user_mission_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.user_missions_user_mission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_missions_user_mission_id_seq OWNER TO infinityadmin;

--
-- Name: user_missions_user_mission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.user_missions_user_mission_id_seq OWNED BY public.user_missions.user_mission_id;


--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.user_stats (
    stat_id integer NOT NULL,
    user_id integer NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    current_exp integer DEFAULT 0 NOT NULL,
    total_points integer DEFAULT 0 NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    last_activity_date date
);


ALTER TABLE public.user_stats OWNER TO infinityadmin;

--
-- Name: user_stats_stat_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.user_stats_stat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_stats_stat_id_seq OWNER TO infinityadmin;

--
-- Name: user_stats_stat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.user_stats_stat_id_seq OWNED BY public.user_stats.stat_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: infinityadmin
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    role public."Role" DEFAULT 'user'::public."Role" NOT NULL,
    profile_img text,
    bio text,
    push_token text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO infinityadmin;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: infinityadmin
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO infinityadmin;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: infinityadmin
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: daily_goals goal_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.daily_goals ALTER COLUMN goal_id SET DEFAULT nextval('public.daily_goals_goal_id_seq'::regclass);


--
-- Name: exercise_categories category_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.exercise_categories ALTER COLUMN category_id SET DEFAULT nextval('public.exercise_categories_category_id_seq'::regclass);


--
-- Name: exercise_videos video_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.exercise_videos ALTER COLUMN video_id SET DEFAULT nextval('public.exercise_videos_video_id_seq'::regclass);


--
-- Name: health_tracking tracking_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.health_tracking ALTER COLUMN tracking_id SET DEFAULT nextval('public.health_tracking_tracking_id_seq'::regclass);


--
-- Name: levels level_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.levels ALTER COLUMN level_id SET DEFAULT nextval('public.levels_level_id_seq'::regclass);


--
-- Name: missions mission_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.missions ALTER COLUMN mission_id SET DEFAULT nextval('public.missions_mission_id_seq'::regclass);


--
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- Name: point_history history_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.point_history ALTER COLUMN history_id SET DEFAULT nextval('public.point_history_history_id_seq'::regclass);


--
-- Name: routines routine_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.routines ALTER COLUMN routine_id SET DEFAULT nextval('public.routines_routine_id_seq'::regclass);


--
-- Name: user_missions user_mission_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.user_missions ALTER COLUMN user_mission_id SET DEFAULT nextval('public.user_missions_user_mission_id_seq'::regclass);


--
-- Name: user_stats stat_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.user_stats ALTER COLUMN stat_id SET DEFAULT nextval('public.user_stats_stat_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: daily_goals; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.daily_goals (goal_id, user_id, title, goal_date, completed, created_at, updated_at) FROM stdin;
1	4	Test	2026-04-06	f	2026-04-06 07:26:06.705	2026-04-06 08:43:12.08
2	2	sdfa	2026-04-07	t	2026-04-07 15:14:00.708	2026-04-07 15:15:15.482
3	4	ตะลุยโจทย์ฟิสิกส์ 8 ชั่วโมง	2026-04-08	f	2026-04-07 18:05:07.895	2026-04-07 18:05:07.895
\.


--
-- Data for Name: exercise_categories; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.exercise_categories (category_id, category_name, icon_url, created_at) FROM stdin;
1	Cardio	https://cdn-icons-png.flaticon.com/512/2548/2548536.png	2026-03-25 20:49:45.021
2	Strength	https://cdn-icons-png.flaticon.com/512/2548/2548455.png	2026-03-25 20:49:45.027
3	Yoga	https://cdn-icons-png.flaticon.com/512/2548/2548515.png	2026-03-25 20:49:45.03
\.


--
-- Data for Name: exercise_videos; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.exercise_videos (video_id, category_id, video_title, video_url, video_thumbnail, difficulty_level, body_part, duration_minutes, description, created_at) FROM stdin;
8	1	15-Minute Beginner Full Body Cardio Workout	https://youtu.be/IvmaekQfKiw?si=plmFMDMDYH2EneTd		beginner	cardio	15	เหมาะสำหรับเพิ่มอัตราการเต้นหัวใจแบบไม่กดดันมาก	2026-04-06 19:25:03.17
9	1	30-Minute Aerobics Low-Impact Cardio	https://youtu.be/DMAxIrCAAZ0?si=4zgHxeerbAwIYnQD		beginner	cardio	30	ทางเลือกยาวขึ้นสำหรับวันสบายๆ	2026-04-06 19:30:00.619
10	1	Intermediate Cardio Workout 	https://youtu.be/wLYeRlyyncY?si=o4nQ2jVeVY848bUP		intermediate	cardio	30	ความเข้มขึ้นจาก beginner พร้อมการเคลื่อนไหวเร็วกว่า	2026-04-06 19:32:02.969
11	1	Beginner/Intermediate interval cardio workout 	https://youtu.be/8MImdWV2WfI?si=2YfrIODQlMvSsGEH		intermediate	cardio	35	ทำเป็นช่วงๆ ปรับความเร็วได้ตามระดับ	2026-04-06 19:35:09.241
12	1	20-Minute Full Body Cardio HIIT Workout 	https://youtu.be/M0uO8X3_tEA?si=XZtVuEe_BJLK6yuw		expert	cardio	20	มีเคลื่อนไหวหนักกว่าระดับกลาง เหมาะเมื่อร่างกายพร้อม	2026-04-06 19:37:00.882
13	1	30-Minute Advanced Standing Cardio HIIT	https://youtu.be/oxQcBkaEQls?si=alaoNTD2oqtVz4VW		expert	cardio	30	ความเข้มข้นสูงกว่า และท่ามีความท้าทายมากขึ้น	2026-04-06 19:38:30.34
14	2	15 นาที กล้ามเนื้อเฟิร์ม ลีนไขมันด้วยดัมเบล (Thai)	https://www.youtube.com/watch?v=0bC2KPoLlek		beginner	weight_full_body	15	วิดีโอสั้น ชัดเจน ใช้ดัมเบล 1 คู่ ฝึกทั่วร่างแบบง่ายตามจังหวะ	2026-04-06 19:43:16.869
15	2	30 Minute Full Body Beginner Dumbbell Workout	https://www.youtube.com/watch?v=GY1JhB9BEkk 		beginner	weight_full_body	30	โปรแกรมพื้นฐาน 30 นาทีสำหรับฝึกแรงต้านทั่วร่าง เหมาะกับลู่วิ่งฝึกครบทุกส่วน	2026-04-06 19:44:35.629
16	2	20 MIN UPPER BODY WITH DUMBBELLS	https://www.youtube.com/watch?v=1xG95-nwlpQ		beginner	weight_upper_body	20	โปรแกรม Upper Body ที่เน้นการเคลื่อนไหวหลากหลาย เหมาะสำหรับผู้เริ่มต้น	2026-04-06 19:46:57.268
17	2	30 Minute Arms & Abs Dumbbell Workout (Upper Body & Core)	https://www.youtube.com/watch?v=N_gu3D0GoFo		beginner	weight_upper_body	30	ฝึกแขน/หัวไหล่/หลัง พร้อมแกนกลาง เหมาะเริ่มสร้างความแข็งแรงช่วงบน	2026-04-06 19:48:24.505
18	2	30 Minute Legs & Abs Dumbbell Workout	https://www.youtube.com/watch?v=ft5GEMixTDw		beginner	weight_lower_body	30	ฝึกขาและแกนกลางพร้อมกัน เพิ่มความแข็งแรงสะโพก/ต้นขา	2026-04-06 19:49:40.44
19	2	45 MIN FULL BODY STRENGTH Workout With Weights (Warm Up & Cool Down Included)	https://www.youtube.com/watch?v=W6wwO_gbn-o		beginner	weight_lower_body	45	45 MIN FULL BODY STRENGTH Workout ก็มี Lower Body ด้วย	2026-04-06 19:51:19.038
20	2	30-Minute Dumbbell Core Workout | No Repeat	https://www.youtube.com/watch?v=4gjTgSCRGRM		beginner	weight_core	30	26 ท่าซ้ำ ๆ เพื่อสร้างแกนกลางแข็งแรง เหมาะเมื่อพื้นฐานดีขึ้น	2026-04-06 19:53:09.809
21	2	20 Minute Lower Body & Abs Strength Workout	https://www.youtube.com/watch?v=FeUGuTwg_7U		beginner	weight_core	20	คลิปรวมท่าแกนกลางและขาออกแรง เหมาะฝึกทั้งส่วนพร้อมกัน	2026-04-06 19:54:26.759
22	2	Intermediate Weight Training Workout with 1 Dumbbell	https://www.youtube.com/watch?v=IMb5OtYGFpE		intermediate	weight_full_body	35	Intermediate Weight Training Workout with 1 Dumbbell	2026-04-06 19:55:46.01
25	2	30-Minute Dumbbell Core Workout | No Repeat	https://youtu.be/4gjTgSCRGRM?si=H4H85FjzCPmnwVnO		intermediate	weight_core	30	เหมาะขึ้นเมื่อเพิ่ม intensity (เพิ่ม weight / timer) 	2026-04-06 20:00:03.98
24	2	30 Minute Legs & Abs Dumbbell Workout	https://youtu.be/ft5GEMixTDw?si=EqiiPg-SeeUmDLTa		intermediate	weight_lower_body	30		2026-04-06 19:58:51.871
23	2	30 Minute Arms & Abs Dumbbell Workout	https://youtu.be/N_gu3D0GoFo?si=0__Ua5QkQglPGBcU		intermediate	weight_upper_body	30		2026-04-06 19:57:11.559
27	2	30 MIN Full Body With Weights (Advanced)	https://youtube.com/playlist?list=PL3D3ysBMhKYXCgbmAwfsU5X_7PAkFgtuv&si=_GqjRBfDVNIo_xAo		expert	weight_upper_body	30	จากด้านบน และสามารถเลือก Upper & Lower Split Workouts จากแหล่ง playlist คลิปรวมฝึก strength ตามต้องการ	2026-04-06 20:03:41.632
26	2	30 Minute Full Body Dumbbell Workout NO REPEAT (Advanced)	https://www.youtube.com/watch?v=4sUGg9mcMGU		expert	weight_full_body	30	ความยาวและความเข้มสูง เหมาะสำหรับผู้ชำนาญ	2026-04-06 20:02:32.154
28	2	45 MIN Full Body Strength Workout	45 MIN Full Body Strength Workout		expert	weight_lower_body	45		2026-04-06 20:04:58.415
29	2	30-Minute Dumbbell Core Workout | No Repeat 	https://youtu.be/4gjTgSCRGRM?si=iBE4-6PJmMVBs1RS		expert	weight_core	30	แล้วเพิ่มความเข้มโดยเพิ่มน้ำหนัก/Interval รวมท่าท่าท้าทายกว่า 30 นาที	2026-04-06 20:05:51.099
\.


--
-- Data for Name: health_tracking; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.health_tracking (tracking_id, user_id, tracking_date, weight, height, water, sleep_hours, steps_count) FROM stdin;
1	1	2026-02-23	70	175	2369	6.5	8126
2	1	2026-02-24	69.8	175	1589	8.8	3898
3	1	2026-02-25	69.7	175	2415	6.7	8229
4	1	2026-02-26	69	175	2083	8.9	3340
5	1	2026-02-27	70.3	175	2123	7.2	9620
6	1	2026-02-28	69.6	175	1976	6.7	7243
7	1	2026-03-01	70.4	175	2222	8.6	9018
8	1	2026-03-02	70.9	175	1504	6.1	8118
9	1	2026-03-03	70	175	1566	7.7	6688
10	1	2026-03-04	69.9	175	2415	6.6	9740
11	1	2026-03-05	69.1	175	2062	8.6	5008
12	1	2026-03-06	70.7	175	2231	8.4	5228
13	1	2026-03-07	70.1	175	1883	8.3	5043
14	1	2026-03-08	69.5	175	1871	7.3	5781
15	1	2026-03-09	70.8	175	2087	7.9	8894
16	1	2026-03-10	70	175	1783	8.6	5254
17	1	2026-03-11	69.1	175	2398	7.3	9179
18	1	2026-03-12	70.3	175	1852	6.5	4029
19	1	2026-03-13	70.1	175	1824	8.6	5643
20	1	2026-03-14	69.2	175	2204	8.1	8197
21	1	2026-03-15	69.8	175	1628	7.9	6267
22	1	2026-03-16	69.7	175	2104	7.2	5893
23	1	2026-03-17	70.5	175	2304	6.8	3770
24	1	2026-03-18	69.9	175	2124	8.3	6054
25	1	2026-03-19	69.9	175	1576	7.2	9847
26	1	2026-03-20	69.4	175	2251	6	3827
27	1	2026-03-21	70.2	175	2157	6.7	4667
28	1	2026-03-22	70.9	175	1531	7.9	3861
29	1	2026-03-23	69.5	175	2162	8.8	5525
30	1	2026-03-24	69.3	175	2053	8.4	4672
31	1	2026-03-25	70.2	175	1899	7.9	7135
36	2	2026-03-27	70	170	0	0	575
37	2	2026-04-06	70	\N	0	0	0
38	3	2026-04-06	\N	\N	\N	\N	143
39	4	2026-04-06	80	175	2500	8	302
41	4	2026-04-07	81	175	2000	8	276
40	2	2026-04-07	70	170	1111	0	0
42	4	2026-04-08	84	175	2500	8	8160
43	4	2026-04-09	\N	\N	\N	\N	179
\.


--
-- Data for Name: levels; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.levels (level_id, level_number, level_name, title_th, color, hex_code, min_exp, max_exp) FROM stdin;
10	10	Beginner 10	เลเวล 10	Bronze	#CD7F32	9000	9999
11	11	Rookie 11	เลเวล 11	Silver	#C0C0C0	10000	10999
12	12	Rookie 12	เลเวล 12	Silver	#C0C0C0	11000	11999
13	13	Rookie 13	เลเวล 13	Silver	#C0C0C0	12000	12999
14	14	Rookie 14	เลเวล 14	Silver	#C0C0C0	13000	13999
15	15	Rookie 15	เลเวล 15	Silver	#C0C0C0	14000	14999
16	16	Rookie 16	เลเวล 16	Silver	#C0C0C0	15000	15999
17	17	Rookie 17	เลเวล 17	Silver	#C0C0C0	16000	16999
22	22	Regular 22	เลเวล 22	Gold	#FFD700	21000	21999
23	23	Regular 23	เลเวล 23	Gold	#FFD700	22000	22999
24	24	Regular 24	เลเวล 24	Gold	#FFD700	23000	23999
25	25	Regular 25	เลเวล 25	Gold	#FFD700	24000	24999
26	26	Regular 26	เลเวล 26	Gold	#FFD700	25000	25999
27	27	Regular 27	เลเวล 27	Gold	#FFD700	26000	26999
28	28	Regular 28	เลเวล 28	Gold	#FFD700	27000	27999
29	29	Regular 29	เลเวล 29	Gold	#FFD700	28000	28999
30	30	Regular 30	เลเวล 30	Gold	#FFD700	29000	29999
31	31	Advanced 31	เลเวล 31	Platinum	#E5E4E2	30000	30999
32	32	Advanced 32	เลเวล 32	Platinum	#E5E4E2	31000	31999
33	33	Advanced 33	เลเวล 33	Platinum	#E5E4E2	32000	32999
34	34	Advanced 34	เลเวล 34	Platinum	#E5E4E2	33000	33999
35	35	Advanced 35	เลเวล 35	Platinum	#E5E4E2	34000	34999
36	36	Advanced 36	เลเวล 36	Platinum	#E5E4E2	35000	35999
37	37	Advanced 37	เลเวล 37	Platinum	#E5E4E2	36000	36999
38	38	Advanced 38	เลเวล 38	Platinum	#E5E4E2	37000	37999
39	39	Advanced 39	เลเวล 39	Platinum	#E5E4E2	38000	38999
40	40	Advanced 40	เลเวล 40	Platinum	#E5E4E2	39000	39999
41	41	Veteran 41	เลเวล 41	Emerald	#50C878	40000	40999
42	42	Veteran 42	เลเวล 42	Emerald	#50C878	41000	41999
43	43	Veteran 43	เลเวล 43	Emerald	#50C878	42000	42999
44	44	Veteran 44	เลเวล 44	Emerald	#50C878	43000	43999
45	45	Veteran 45	เลเวล 45	Emerald	#50C878	44000	44999
46	46	Veteran 46	เลเวล 46	Emerald	#50C878	45000	45999
47	47	Veteran 47	เลเวล 47	Emerald	#50C878	46000	46999
48	48	Veteran 48	เลเวล 48	Emerald	#50C878	47000	47999
49	49	Veteran 49	เลเวล 49	Emerald	#50C878	48000	48999
50	50	Veteran 50	เลเวล 50	Emerald	#50C878	49000	49999
51	51	Elite 51	เลเวล 51	Sapphire	#0F52BA	50000	50999
52	52	Elite 52	เลเวล 52	Sapphire	#0F52BA	51000	51999
53	53	Elite 53	เลเวล 53	Sapphire	#0F52BA	52000	52999
54	54	Elite 54	เลเวล 54	Sapphire	#0F52BA	53000	53999
55	55	Elite 55	เลเวล 55	Sapphire	#0F52BA	54000	54999
56	56	Elite 56	เลเวล 56	Sapphire	#0F52BA	55000	55999
57	57	Elite 57	เลเวล 57	Sapphire	#0F52BA	56000	56999
58	58	Elite 58	เลเวล 58	Sapphire	#0F52BA	57000	57999
59	59	Elite 59	เลเวล 59	Sapphire	#0F52BA	58000	58999
60	60	Elite 60	เลเวล 60	Sapphire	#0F52BA	59000	59999
61	61	Master 61	เลเวล 61	Ruby	#E0115F	60000	60999
62	62	Master 62	เลเวล 62	Ruby	#E0115F	61000	61999
63	63	Master 63	เลเวล 63	Ruby	#E0115F	62000	62999
64	64	Master 64	เลเวล 64	Ruby	#E0115F	63000	63999
65	65	Master 65	เลเวล 65	Ruby	#E0115F	64000	64999
66	66	Master 66	เลเวล 66	Ruby	#E0115F	65000	65999
2	2	Beginner 2	เลเวล 2	Bronze	#CD7F32	1000	1999
3	3	Beginner 3	เลเวล 3	Bronze	#CD7F32	2000	2999
4	4	Beginner 4	เลเวล 4	Bronze	#CD7F32	3000	3999
5	5	Beginner 5	เลเวล 5	Bronze	#CD7F32	4000	4999
6	6	Beginner 6	เลเวล 6	Bronze	#CD7F32	5000	5999
7	7	Beginner 7	เลเวล 7	Bronze	#CD7F32	6000	6999
8	8	Beginner 8	เลเวล 8	Bronze	#CD7F32	7000	7999
9	9	Beginner 9	เลเวล 9	Bronze	#CD7F32	8000	8999
18	18	Rookie 18	เลเวล 18	Silver	#C0C0C0	17000	17999
19	19	Rookie 19	เลเวล 19	Silver	#C0C0C0	18000	18999
20	20	Rookie 20	เลเวล 20	Silver	#C0C0C0	19000	19999
21	21	Regular 21	เลเวล 21	Gold	#FFD700	20000	20999
74	74	Grandmaster 74	เลเวล 74	Amethyst	#9966CC	73000	73999
75	75	Grandmaster 75	เลเวล 75	Amethyst	#9966CC	74000	74999
76	76	Grandmaster 76	เลเวล 76	Amethyst	#9966CC	75000	75999
77	77	Grandmaster 77	เลเวล 77	Amethyst	#9966CC	76000	76999
78	78	Grandmaster 78	เลเวล 78	Amethyst	#9966CC	77000	77999
79	79	Grandmaster 79	เลเวล 79	Amethyst	#9966CC	78000	78999
80	80	Grandmaster 80	เลเวล 80	Amethyst	#9966CC	79000	79999
1	1	Beginner 1	เลเวล 1	Bronze	#CD7F32	0	999
67	67	Master 67	เลเวล 67	Ruby	#E0115F	66000	66999
68	68	Master 68	เลเวล 68	Ruby	#E0115F	67000	67999
69	69	Master 69	เลเวล 69	Ruby	#E0115F	68000	68999
70	70	Master 70	เลเวล 70	Ruby	#E0115F	69000	69999
71	71	Grandmaster 71	เลเวล 71	Amethyst	#9966CC	70000	70999
72	72	Grandmaster 72	เลเวล 72	Amethyst	#9966CC	71000	71999
73	73	Grandmaster 73	เลเวล 73	Amethyst	#9966CC	72000	72999
81	81	Legend 81	เลเวล 81	Diamond	#00CED1	80000	80999
82	82	Legend 82	เลเวล 82	Diamond	#00CED1	81000	81999
83	83	Legend 83	เลเวล 83	Diamond	#00CED1	82000	82999
84	84	Legend 84	เลเวล 84	Diamond	#00CED1	83000	83999
85	85	Legend 85	เลเวล 85	Diamond	#00CED1	84000	84999
86	86	Legend 86	เลเวล 86	Diamond	#00CED1	85000	85999
87	87	Legend 87	เลเวล 87	Diamond	#00CED1	86000	86999
88	88	Legend 88	เลเวล 88	Diamond	#00CED1	87000	87999
89	89	Legend 89	เลเวล 89	Diamond	#00CED1	88000	88999
90	90	Legend 90	เลเวล 90	Diamond	#00CED1	89000	89999
91	91	Titan 91	เลเวล 91	Obsidian	#1C1C1C	90000	90999
92	92	Titan 92	เลเวล 92	Obsidian	#1C1C1C	91000	91999
93	93	Titan 93	เลเวล 93	Obsidian	#1C1C1C	92000	92999
94	94	Titan 94	เลเวล 94	Obsidian	#1C1C1C	93000	93999
95	95	Titan 95	เลเวล 95	Obsidian	#1C1C1C	94000	94999
96	96	Titan 96	เลเวล 96	Obsidian	#1C1C1C	95000	95999
97	97	Titan 97	เลเวล 97	Obsidian	#1C1C1C	96000	96999
98	98	Titan 98	เลเวล 98	Obsidian	#1C1C1C	97000	97999
99	99	Titan 99	เลเวล 99	Obsidian	#1C1C1C	98000	98999
100	100	Infinity God	เลเวล 100	Infinity	#FF00FF	99000	99999
\.


--
-- Data for Name: missions; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.missions (mission_id, mission_name, mission_type, required_level, reward_exp, reward_points, target_value, target_unit, duration_days, description, start_time, end_time, is_active, presets) FROM stdin;
3	บันทึกสุขภาพประจำวัน	DAILY	1	30	1	1	time	\N	กรอกข้อมูลสุขภาพ (น้ำหนัก, การนอน, ฯลฯ)	00:00	23:59	t	\N
4	บันทึกกิจวัตรหรือเป้าหมายประจำวัน	DAILY	1	35	1	1	time	\N	เพิ่มกิจวัตรหรือเป้าหมาย 1 ครั้ง	00:00	23:59	t	\N
5	รักษาความสม่ำเสมอ (Streak Mission)	DAILY	1	45	3	3	mission	\N	ทำภารกิจใดก็ได้ครบ 3 ภารกิจในวันเดียว	00:00	23:59	t	\N
6	ขยับร่างกาย ≥ 5 นาที	CHALLENGE	1	0	0	5	minutes	\N	ขยับร่างกาย ≥ 5 นาที	00:00	23:59	t	\N
7	ดื่มน้ำเพิ่มจากปกติ ≥ 1 แก้ว	CHALLENGE	2	0	0	1	glass	\N	ดื่มน้ำเพิ่มจากปกติ ≥ 1 แก้ว	00:00	23:59	t	\N
8	หยุดจอ (มือถือ/คอม) ติดต่อกัน ≥ 10 นาที	CHALLENGE	3	0	0	10	minutes	\N	หยุดจอ (มือถือ/คอม) ติดต่อกัน ≥ 10 นาที	00:00	23:59	t	\N
9	เดิน ≥ 1,000 ก้าว	CHALLENGE	4	0	0	1000	steps	\N	เดิน ≥ 1,000 ก้าว	00:00	23:59	t	\N
10	ดื่มน้ำ ≥ 5 แก้ว	CHALLENGE	5	0	0	1250	ml	\N	ดื่มน้ำ ≥ 5 แก้ว	00:00	23:59	t	\N
11	ขยับร่างกาย ≥ 10 นาที	CHALLENGE	6	0	0	10	minutes	\N	ขยับร่างกาย ≥ 10 นาที	00:00	23:59	t	\N
12	เลือกอาหารที่ไม่ทอด/ไม่หวาน ≥ 1 มื้อ	CHALLENGE	7	0	0	1	meal	\N	เลือกอาหารที่ไม่ทอด/ไม่หวาน ≥ 1 มื้อ	00:00	23:59	t	\N
13	เดิน ≥ 2,000 ก้าว	CHALLENGE	8	0	0	2000	steps	\N	เดิน ≥ 2,000 ก้าว	00:00	23:59	t	\N
14	พักผ่อนหรือผ่อนคลาย ≥ 10 นาที	CHALLENGE	9	0	0	10	minutes	\N	พักผ่อนหรือผ่อนคลาย ≥ 10 นาที	00:00	23:59	t	\N
15	ทำ Daily Mission ใดก็ได้ ≥ 1 รายการ	CHALLENGE	10	0	0	1	mission	\N	ทำ Daily Mission ใดก็ได้ ≥ 1 รายการ	00:00	23:59	t	\N
16	เดิน ≥ 3,000 ก้าว	CHALLENGE	11	0	0	3000	steps	\N	เดิน ≥ 3,000 ก้าว	00:00	23:59	t	\N
17	ดื่มน้ำ ≥ 6 แก้ว	CHALLENGE	12	0	0	1500	ml	\N	ดื่มน้ำ ≥ 6 แก้ว	00:00	23:59	t	\N
18	หยุดจอ ≥ 15 นาที	CHALLENGE	13	0	0	15	minutes	\N	หยุดจอ ≥ 15 นาที	00:00	23:59	t	\N
19	นอน ≥ 6 ชั่วโมง	CHALLENGE	14	0	0	6	hours	\N	นอน ≥ 6 ชั่วโมง	00:00	23:59	t	\N
20	ขยับร่างกาย ≥ 10 นาที	CHALLENGE	15	0	0	3	days	\N	ขยับร่างกาย ≥ 10 นาที (ทำ 3 วัน)	00:00	23:59	t	\N
21	เดิน ≥ 4,000 ก้าว	CHALLENGE	16	0	0	4000	steps	\N	เดิน ≥ 4,000 ก้าว	00:00	23:59	t	\N
22	ดื่มน้ำ ≥ 7 แก้ว	CHALLENGE	17	0	0	1750	ml	\N	ดื่มน้ำ ≥ 7 แก้ว	00:00	23:59	t	\N
23	ผ่อนคลาย/หายใจลึก ≥ 10 นาที	CHALLENGE	18	0	0	10	minutes	\N	ผ่อนคลาย/หายใจลึก ≥ 10 นาที	00:00	23:59	t	\N
24	นอน–ตื่นเวลาใกล้เคียงกัน (±1 ชม.)	CHALLENGE	19	0	0	1	consistency	\N	นอน–ตื่นเวลาใกล้เคียงกัน (±1 ชม.)	00:00	23:59	t	\N
25	Self-Care Planner Review – ระดับต้น	CHALLENGE	20	0	0	1	review	\N	Self-Care Planner Review – ระดับต้น	00:00	23:59	t	\N
26	เดิน ≥ 5,000 ก้าว/วัน	CHALLENGE	21	0	0	5000	steps	\N	เดิน ≥ 5,000 ก้าว/วัน	00:00	23:59	t	\N
27	ดื่มน้ำ ≥ 8 แก้ว/วัน	CHALLENGE	22	0	0	2000	ml	\N	ดื่มน้ำ ≥ 8 แก้ว/วัน	00:00	23:59	t	\N
28	ขยับร่างกาย/ออกกำลังกาย ≥ 15 นาที	CHALLENGE	23	0	0	15	minutes	\N	ขยับร่างกาย/ออกกำลังกาย ≥ 15 นาที	00:00	23:59	t	\N
29	นอน ≥ 6.5 ชั่วโมง	CHALLENGE	24	0	0	6	hours	\N	นอน ≥ 6.5 ชั่วโมง	00:00	23:59	t	\N
30	เลือกอาหารดี ≥ 2 มื้อ/วัน	CHALLENGE	25	0	0	2	meal	\N	เลือกอาหารดี ≥ 2 มื้อ/วัน	00:00	23:59	t	\N
31	เดิน ≥ 5,000 ก้าว/วัน	CHALLENGE	26	0	0	3	days	\N	เดิน ≥ 5,000 ก้าว/วัน (ทำ 3 วัน)	00:00	23:59	t	\N
32	ดื่มน้ำ ≥ 8 แก้ว/วัน	CHALLENGE	27	0	0	3	days	\N	ดื่มน้ำ ≥ 8 แก้ว/วัน (ทำ 3 วัน)	00:00	23:59	t	\N
33	พักผ่อน/ผ่อนคลาย ≥ 15 นาที	CHALLENGE	28	0	0	15	minutes	\N	พักผ่อน/ผ่อนคลาย ≥ 15 นาที	00:00	23:59	t	\N
34	นอน–ตื่นเวลาใกล้เคียงกัน (±45 นาที)	CHALLENGE	29	0	0	1	consistency	\N	นอน–ตื่นเวลาใกล้เคียงกัน (±45 นาที)	00:00	23:59	t	\N
35	ทำ Daily Mission ≥ 2 รายการ/วัน	CHALLENGE	30	0	0	2	mission	\N	ทำ Daily Mission ≥ 2 รายการ/วัน	00:00	23:59	t	\N
36	เดิน ≥ 6,000 ก้าว/วัน	CHALLENGE	31	0	0	6000	steps	\N	เดิน ≥ 6,000 ก้าว/วัน	00:00	23:59	t	\N
37	ออกกำลังกาย ≥ 20 นาที	CHALLENGE	32	0	0	20	minutes	\N	ออกกำลังกาย ≥ 20 นาที	00:00	23:59	t	\N
38	ดื่มน้ำครบเป้า	CHALLENGE	33	0	0	2000	ml	\N	ดื่มน้ำครบเป้า	00:00	23:59	t	\N
39	นอน ≥ 7 ชั่วโมง	CHALLENGE	34	0	0	7	hours	\N	นอน ≥ 7 ชั่วโมง	00:00	23:59	t	\N
1	งดน้ำตาล 1 มื้อ	DAILY	1	40	2	1	มื้อ	1		00:00	23:59	t	[]
40	เดิน ≥ 6,000 ก้าว/วัน	CHALLENGE	35	0	0	5	days	\N	เดิน ≥ 6,000 ก้าว/วัน (ทำ 5 วัน)	00:00	23:59	t	\N
41	ออกกำลังกาย ≥ 30 นาที	CHALLENGE	36	0	0	30	minutes	\N	ออกกำลังกาย ≥ 30 นาที	00:00	23:59	t	\N
42	เลือกอาหารตามสัดส่วนเหมาะสม	CHALLENGE	37	0	0	1	meal	\N	เลือกอาหารตามสัดส่วนเหมาะสม (เช่น 2:1:1)	00:00	23:59	t	\N
43	พักจริง (ไม่จอ/ไม่งาน) ≥ 20 นาที	CHALLENGE	38	0	0	20	minutes	\N	พักจริง (ไม่จอ/ไม่งาน) ≥ 20 นาที	00:00	23:59	t	\N
44	ดูแลสุขภาพครบ 3 มิติในวันเดียว	CHALLENGE	39	0	0	3	dimensions	\N	ดูแลสุขภาพครบ 3 มิติในวันเดียว (ขยับ–กิน–พัก)	00:00	23:59	t	\N
45	Self-Care Planner Review – ระดับกลาง	CHALLENGE	40	0	0	1	review	\N	Self-Care Planner Review – ระดับกลาง	00:00	23:59	t	\N
46	เดิน ≥ 6,000 ก้าว/วัน	CHALLENGE	41	0	0	4	days	\N	เดิน ≥ 6,000 ก้าว/วัน (ทำ 4 วัน)	00:00	23:59	t	\N
47	ออกกำลังกาย ≥ 20 นาที/วัน	CHALLENGE	42	0	0	20	minutes	\N	ออกกำลังกาย ≥ 20 นาที/วัน	00:00	23:59	t	\N
48	ดื่มน้ำครบเป้า (≈ 8 แก้ว/วัน)	CHALLENGE	43	0	0	2000	ml	\N	ดื่มน้ำครบเป้า (≈ 8 แก้ว/วัน)	00:00	23:59	t	\N
49	นอน ≥ 7 ชั่วโมง/คืน	CHALLENGE	44	0	0	7	hours	\N	นอน ≥ 7 ชั่วโมง/คืน	00:00	23:59	t	\N
50	เดิน ≥ 6,000 ก้าว/วัน	CHALLENGE	45	0	0	5	days	\N	เดิน ≥ 6,000 ก้าว/วัน (ทำ 5 วัน)	00:00	23:59	t	\N
51	ออกกำลังกาย ≥ 30 นาที/วัน	CHALLENGE	46	0	0	30	minutes	\N	ออกกำลังกาย ≥ 30 นาที/วัน	00:00	23:59	t	\N
52	เลือกอาหารตามสัดส่วนเหมาะสม	CHALLENGE	47	0	0	4	days	\N	เลือกอาหารตามสัดส่วนเหมาะสม (ทำ 4 วัน)	00:00	23:59	t	\N
53	พักจริง (ไม่จอ/ไม่งาน) ≥ 20 นาที/วัน	CHALLENGE	48	0	0	20	minutes	\N	พักจริง (ไม่จอ/ไม่งาน) ≥ 20 นาที/วัน	00:00	23:59	t	\N
54	ดูแลสุขภาพครบ 3 มิติในวันเดียว	CHALLENGE	49	0	0	3	days	\N	ดูแลสุขภาพครบ 3 มิติในวันเดียว (ทำ 3 วัน)	00:00	23:59	t	\N
55	ทำ Daily Mission ≥ 70% ของวันที่ใช้งาน	CHALLENGE	50	0	0	70	percent	\N	ทำ Daily Mission ≥ 70% ของวันที่ใช้งาน	00:00	23:59	t	\N
56	เดิน ≥ 7,000 ก้าว/วัน	CHALLENGE	51	0	0	7000	steps	\N	เดิน ≥ 7,000 ก้าว/วัน	00:00	23:59	t	\N
57	ออกกำลังกาย ≥ 30 นาที/วัน	CHALLENGE	52	0	0	30	minutes	\N	ออกกำลังกาย ≥ 30 นาที/วัน	00:00	23:59	t	\N
58	ดื่มน้ำครบเป้า	CHALLENGE	53	0	0	6	days	\N	ดื่มน้ำครบเป้า (ทำ 6 วัน)	00:00	23:59	t	\N
59	นอน ≥ 7 ชั่วโมง/คืน	CHALLENGE	54	0	0	4	nights	\N	นอน ≥ 7 ชั่วโมง/คืน (ทำ 4 คืน)	00:00	23:59	t	\N
60	วางแผนกิจกรรมสุขภาพล่วงหน้า	CHALLENGE	55	0	0	1	plan	\N	วางแผนกิจกรรมสุขภาพล่วงหน้า (Planner)	00:00	23:59	t	\N
61	เลือกอาหารให้เหมาะกับกิจกรรม	CHALLENGE	56	0	0	1	meal	\N	เลือกอาหารให้เหมาะกับกิจกรรมของวันนั้น	00:00	23:59	t	\N
62	ออกกำลังกายตามแผนที่ตั้งเอง	CHALLENGE	57	0	0	1	class	\N	ออกกำลังกายตามแผนที่ตั้งเอง	00:00	23:59	t	\N
63	ดูแลสุขภาพครบ 4 มิติในวันเดียว	CHALLENGE	58	0	0	4	dimensions	\N	ดูแลสุขภาพครบ 4 มิติในวันเดียว (ขยับ–กิน–ดื่ม–พัก)	00:00	23:59	t	\N
64	ปรับกิจกรรมจากระดับพลังงาน	CHALLENGE	59	0	0	1	adjustment	\N	ปรับกิจกรรมจากระดับพลังงาน/ความล้าของวันนั้น	00:00	23:59	t	\N
65	Self-Care Planner Review – ระดับคุณภาพ	CHALLENGE	60	0	0	1	review	\N	Self-Care Planner Review – ระดับคุณภาพ	00:00	23:59	t	\N
66	เดิน ≥ 7,500 ก้าว/วัน	CHALLENGE	61	0	0	7500	steps	\N	เดิน ≥ 7,500 ก้าว/วัน	00:00	23:59	t	\N
67	ออกกำลังกายตาม “เป้าหมายเฉพาะตน”	CHALLENGE	62	0	0	30	minutes	\N	ออกกำลังกายตาม “เป้าหมายเฉพาะตน” (เช่น คาร์ดิโอ/แรงต้าน/ผ่อนคลาย) ≥ 30 นาที	00:00	23:59	t	\N
68	ดื่มน้ำสัมพันธ์กับกิจกรรมของวัน	CHALLENGE	63	0	0	1	check	\N	ดื่มน้ำสัมพันธ์กับกิจกรรมของวัน (มากขึ้นในวันออกกำลัง)	00:00	23:59	t	\N
69	นอนคุณภาพดี ≥ 7 ชั่วโมง	CHALLENGE	64	0	0	7	hours	\N	นอนคุณภาพดี ≥ 7 ชั่วโมง (เข้านอนสม่ำเสมอ/ไม่จอก่อนนอน)	00:00	23:59	t	\N
70	ดูแลสุขภาพครบ 4 มิติในวันเดียว	CHALLENGE	65	0	0	4	days	\N	ดูแลสุขภาพครบ 4 มิติในวันเดียว (ทำ 4 วัน)	00:00	23:59	t	\N
71	เดิน ≥ 8,000 ก้าว/วัน	CHALLENGE	66	0	0	8000	steps	\N	เดิน ≥ 8,000 ก้าว/วัน	00:00	23:59	t	\N
72	ออกกำลังกายโดย “ปรับความหนักเอง”	CHALLENGE	67	0	0	1	check	\N	ออกกำลังกายโดย “ปรับความหนักเอง” ให้ไม่ล้าสะสม	00:00	23:59	t	\N
73	ปรับแผนสุขภาพจากข้อมูลจริง	CHALLENGE	68	0	0	1	plan	\N	ปรับแผนสุขภาพจากข้อมูลจริง (ก้าว/เวลา/พลังงาน)	00:00	23:59	t	\N
74	รักษาสมดุล “วันทำงาน–วันพัก”	CHALLENGE	69	0	0	4	days	\N	รักษาสมดุล “วันทำงาน–วันพัก”	00:00	23:59	t	\N
75	ทำตามแผนสุขภาพที่ตั้งเอง	CHALLENGE	70	0	0	5	days	\N	ทำตามแผนสุขภาพที่ตั้งเอง (Planner-Driven Day)	00:00	23:59	t	\N
76	Daily Mission Completion ≥ 80%	CHALLENGE	71	0	0	7	days	\N	Daily Mission Completion ≥ 80% (ต่อเนื่อง 7 วัน)	00:00	23:59	t	\N
77	เดินเฉลี่ย ≥ 8,000 ก้าว/วัน	CHALLENGE	72	0	0	8000	avg_steps	\N	เดินเฉลี่ย ≥ 8,000 ก้าว/วัน (1 สัปดาห์)	00:00	23:59	t	\N
78	ออกกำลังกายโดยไม่เกิดความล้าสะสม	CHALLENGE	73	0	0	5	days	\N	ออกกำลังกายโดยไม่เกิดความล้าสะสม	00:00	23:59	t	\N
79	นอน–ตื่นเป็นเวลาเดียวกัน (±30 นาที)	CHALLENGE	74	0	0	5	nights	\N	นอน–ตื่นเป็นเวลาเดียวกัน (±30 นาที)	00:00	23:59	t	\N
80	ทดลองกิจกรรมสุขภาพใหม่ที่ “เหมาะกับตน”	CHALLENGE	75	0	0	1	activity	\N	ทดลองกิจกรรมสุขภาพใหม่ที่ “เหมาะกับตน”	00:00	23:59	t	\N
81	รักษาพฤติกรรมหลักโดยไม่ต้องแจ้งเตือน	CHALLENGE	76	0	0	5	days	\N	รักษาพฤติกรรมหลักโดยไม่ต้องแจ้งเตือน	00:00	23:59	t	\N
82	ปรับพฤติกรรมทันทีเมื่อรู้สึกล้า/ตึง	CHALLENGE	77	0	0	4	days	\N	ปรับพฤติกรรมทันทีเมื่อรู้สึกล้า/ตึง	00:00	23:59	t	\N
83	ดูแลสุขภาพครบ 4 มิติอย่างสมดุล	CHALLENGE	78	0	0	4	dimensions	\N	ดูแลสุขภาพครบ 4 มิติอย่างสมดุล	00:00	23:59	t	\N
84	ประเมินและเลือก “กิจกรรมหลักที่เหมาะกับตนที่สุด”	CHALLENGE	79	0	0	1	selection	\N	ประเมินและเลือก “กิจกรรมหลักที่เหมาะกับตนที่สุด”	00:00	23:59	t	\N
85	Self-Care Planner Review – ระดับ Personalization	CHALLENGE	80	0	0	1	review	\N	Self-Care Planner Review – ระดับ Personalization	00:00	23:59	t	\N
86	Daily Mission Completion ≥ 85%	CHALLENGE	81	0	0	7	days	\N	Daily Mission Completion ≥ 85% (ต่อเนื่อง 7 วัน)	00:00	23:59	t	\N
87	รักษา “วันสมดุล” (ขยับ–กิน–ดื่ม–พัก ครบ)	CHALLENGE	82	0	0	4	days	\N	รักษา “วันสมดุล” (ขยับ–กิน–ดื่ม–พัก ครบ)	00:00	23:59	t	\N
88	นอน–ตื่นสม่ำเสมอ (±30 นาที)	CHALLENGE	83	0	0	5	nights	\N	นอน–ตื่นสม่ำเสมอ (±30 นาที)	00:00	23:59	t	\N
89	รักษาพฤติกรรมหลักโดย ไม่พึ่งการแจ้งเตือน	CHALLENGE	84	0	0	5	days	\N	รักษาพฤติกรรมหลักโดย ไม่พึ่งการแจ้งเตือน	00:00	23:59	t	\N
90	ปรับกิจกรรมตามสัญญาณร่างกาย (ไม่ฝืน/ไม่ละเลย)	CHALLENGE	85	0	0	4	days	\N	ปรับกิจกรรมตามสัญญาณร่างกาย	00:00	23:59	t	\N
91	รักษาสมดุล “วันทำงาน–วันพัก” ตลอดสัปดาห์	CHALLENGE	86	0	0	1	week	\N	รักษาสมดุล “วันทำงาน–วันพัก” ตลอดสัปดาห์	00:00	23:59	t	\N
92	ทำ Daily Mission ต่อนเนื่องโดย ไม่มี Penalty	CHALLENGE	87	0	0	7	days	\N	ทำ Daily Mission ต่อนเนื่องโดย ไม่มี Penalty (7 วัน)	00:00	23:59	t	\N
93	ถ่ายทอด/ชวนผู้อื่นทำกิจกรรมสุขภาพ	CHALLENGE	88	0	0	1	time	\N	ถ่ายทอด/ชวนผู้อื่นทำกิจกรรมสุขภาพอย่างน้อย 1 ครั้ง	00:00	23:59	t	\N
94	ประเมินและคงไว้ซึ่ง “กิจกรรมหลักของฉัน”	CHALLENGE	89	0	0	3	days	\N	ประเมินและคงไว้ซึ่ง “กิจกรรมหลักของฉัน”	00:00	23:59	t	\N
95	Planner + Daily Mission Completion ≥ 90%	CHALLENGE	90	0	0	90	percent	\N	Planner + Daily Mission Completion ≥ 90%	00:00	23:59	t	\N
96	รักษาพฤติกรรมหลักใน “วันที่ยุ่ง/มีอุปสรรค”	CHALLENGE	91	0	0	4	days	\N	รักษาพฤติกรรมหลักใน “วันที่ยุ่ง/มีอุปสรรค”	00:00	23:59	t	\N
97	ปรับแผนสุขภาพอย่างยืดหยุ่นเมื่อมีการเปลี่ยนแปลง	CHALLENGE	92	0	0	3	days	\N	ปรับแผนสุขภาพอย่างยืดหยุ่นเมื่อมีการเปลี่ยนแปลง	00:00	23:59	t	\N
98	รักษา Streak สุขภาพโดยรวม	CHALLENGE	93	0	0	21	days	\N	รักษา Streak สุขภาพโดยรวม (21 วัน)	00:00	23:59	t	\N
99	คงระดับพลังงานชีวิต “ไม่ล้าสะสม”	CHALLENGE	94	0	0	5	days	\N	คงระดับพลังงานชีวิต “ไม่ล้าสะสม”	00:00	23:59	t	\N
100	ตัดสินใจเลือกพฤติกรรมสุขภาพได้เองโดยไม่ต้องเตือน	CHALLENGE	95	0	0	5	days	\N	ตัดสินใจเลือกพฤติกรรมสุขภาพได้เองโดยไม่ต้องเตือน	00:00	23:59	t	\N
101	กลับสู่กิจวัตรสุขภาพได้ภายใน 24 ชม. เมื่อพลาด	CHALLENGE	96	0	0	2	times	\N	กลับสู่กิจวัตรสุขภาพได้ภายใน 24 ชม. เมื่อพลาด	00:00	23:59	t	\N
102	ทำหน้าที่สนับสนุน/เป็นแรงบันดาลใจด้านสุขภาพ	CHALLENGE	97	0	0	1	time	\N	ทำหน้าที่สนับสนุน/เป็นแรงบันดาลใจด้านสุขภาพ	00:00	23:59	t	\N
103	สรุปบทเรียนสุขภาพจากข้อมูลจริงของตน	CHALLENGE	98	0	0	1	submission	\N	สรุปบทเรียนสุขภาพจากข้อมูลจริงของตน	00:00	23:59	t	\N
104	รักษาวิถีชีวิตสุขภาพในแบบที่ตนเลือก	CHALLENGE	99	0	0	7	days	\N	รักษาวิถีชีวิตสุขภาพในแบบที่ตนเลือก (7 วัน)	00:00	23:59	t	\N
105	Sustainable Lifestyle Master Review	CHALLENGE	100	0	0	1	review	\N	Sustainable Lifestyle Master Review	00:00	23:59	t	\N
2	เคลื่อนไหวร่างกาย	DAILY	1	50	3	30	min	1	ออกกำลังกาย 30 นาที	00:00	23:59	t	[{"label": "5 min", "value": 5}, {"label": "10 min", "value": 10}]
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.notifications (notification_id, user_id, type, title, message, is_read, is_sent, noti_at, reference_id, created_at) FROM stdin;
30	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-17 04:23:00.028	2	2026-04-17 04:23:00.029
31	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-17 18:30:00.143	6	2026-04-17 18:30:00.144
32	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-18 04:23:00.015	2	2026-04-18 04:23:00.015
4	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-07 04:23:00.016	2	2026-04-07 04:23:00.017
12	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-08 04:23:00.018	2	2026-04-08 04:23:00.019
13	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-08 18:30:00.015	6	2026-04-08 18:30:00.015
14	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-09 04:23:00.019	2	2026-04-09 04:23:00.019
15	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-09 18:30:00.022	6	2026-04-09 18:30:00.023
16	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-10 04:23:00.019	2	2026-04-10 04:23:00.02
17	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-10 18:30:00.015	6	2026-04-10 18:30:00.016
18	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-11 04:23:00.019	2	2026-04-11 04:23:00.02
19	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-11 18:30:00.016	6	2026-04-11 18:30:00.017
20	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-12 04:23:00.014	2	2026-04-12 04:23:00.015
21	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-12 18:30:00.015	6	2026-04-12 18:30:00.016
22	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-13 04:23:00.017	2	2026-04-13 04:23:00.018
23	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-13 18:30:00.025	6	2026-04-13 18:30:00.026
24	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-14 04:23:00.026	2	2026-04-14 04:23:00.027
25	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-14 18:30:00.02	6	2026-04-14 18:30:00.021
26	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-15 04:23:00.016	2	2026-04-15 04:23:00.017
27	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-15 18:30:00.017	6	2026-04-15 18:30:00.018
28	3	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา Test แล้วนะครับ	f	f	2026-04-16 04:23:00.016	2	2026-04-16 04:23:00.017
29	4	ROUTINE_REMINDER	ได้เวลาแล้ว!	ถึงเวลา เตรียมตัวเข้านอน แล้วนะครับ	f	f	2026-04-16 18:30:00.016	6	2026-04-16 18:30:00.017
\.


--
-- Data for Name: point_history; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.point_history (history_id, user_id, mission_id, points_earned, point_type, earned_at) FROM stdin;
\.


--
-- Data for Name: routines; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.routines (routine_id, user_id, title, scheduled_time, scheduled_date, completed, notifications, created_at, updated_at) FROM stdin;
1	2	000	21:16	2026-03-27	t	t	2026-03-27 14:15:29.052	2026-03-27 14:16:44.539
2	3	Test	11:23	2026-04-06	f	t	2026-04-06 04:22:53.134	2026-04-06 04:22:53.134
3	4	Test	14:30	2026-04-06	t	t	2026-04-06 07:26:18.132	2026-04-06 08:43:13.27
6	4	เตรียมตัวเข้านอน	01:30	2026-04-08	f	t	2026-04-07 18:06:45.353	2026-04-07 18:06:45.353
\.


--
-- Data for Name: user_missions; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.user_missions (user_mission_id, user_id, mission_id, start_date, end_date, current_progress, status, completed_at, is_claimed, claimed_at, created_at, updated_at) FROM stdin;
2	2	3	\N	\N	1	t	2026-03-27 14:13:44.803	f	\N	2026-03-27 14:13:44.804	2026-03-27 14:13:44.804
3	2	31	\N	\N	556	t	2026-03-27 14:13:44.89	f	\N	2026-03-27 14:13:44.891	2026-03-27 14:13:44.891
4	2	40	\N	\N	556	t	2026-03-27 14:13:44.903	f	\N	2026-03-27 14:13:44.904	2026-03-27 14:13:44.904
5	2	46	\N	\N	556	t	2026-03-27 14:13:44.92	f	\N	2026-03-27 14:13:44.92	2026-03-27 14:13:44.92
6	2	50	\N	\N	556	t	2026-03-27 14:13:44.929	f	\N	2026-03-27 14:13:44.929	2026-03-27 14:13:44.929
7	2	5	\N	\N	5	t	2026-03-27 14:13:44.939	f	\N	2026-03-27 14:13:44.94	2026-03-27 14:13:44.94
8	2	4	\N	\N	1	t	2026-03-27 14:15:29.06	f	\N	2026-03-27 14:15:29.061	2026-03-27 14:15:29.061
9	2	3	\N	\N	1	t	2026-04-05 23:13:50.885	f	\N	2026-04-05 23:13:50.885	2026-04-05 23:13:50.885
10	3	3	\N	\N	1	t	2026-04-06 04:11:59.938	f	\N	2026-04-06 04:11:59.938	2026-04-06 04:11:59.938
11	3	31	\N	\N	67	t	2026-04-06 04:11:59.964	f	\N	2026-04-06 04:11:59.964	2026-04-06 04:11:59.964
12	3	40	\N	\N	67	t	2026-04-06 04:11:59.974	f	\N	2026-04-06 04:11:59.975	2026-04-06 04:11:59.975
13	3	46	\N	\N	67	t	2026-04-06 04:11:59.98	f	\N	2026-04-06 04:11:59.981	2026-04-06 04:11:59.981
14	3	50	\N	\N	67	t	2026-04-06 04:11:59.986	f	\N	2026-04-06 04:11:59.987	2026-04-06 04:11:59.987
15	3	5	\N	\N	5	t	2026-04-06 04:11:59.995	f	\N	2026-04-06 04:11:59.996	2026-04-06 04:11:59.996
16	3	4	\N	\N	1	t	2026-04-06 04:22:53.141	f	\N	2026-04-06 04:22:53.142	2026-04-06 04:22:53.142
17	4	3	\N	\N	1	t	2026-04-06 04:27:37.607	f	\N	2026-04-06 04:27:37.607	2026-04-06 04:27:37.607
18	4	31	\N	\N	143	t	2026-04-06 04:27:37.63	f	\N	2026-04-06 04:27:37.63	2026-04-06 04:27:37.63
19	4	40	\N	\N	143	t	2026-04-06 04:27:37.639	f	\N	2026-04-06 04:27:37.639	2026-04-06 04:27:37.639
20	4	46	\N	\N	143	t	2026-04-06 04:27:37.645	f	\N	2026-04-06 04:27:37.646	2026-04-06 04:27:37.646
21	4	50	\N	\N	143	t	2026-04-06 04:27:37.651	f	\N	2026-04-06 04:27:37.652	2026-04-06 04:27:37.652
22	4	5	\N	\N	5	t	2026-04-06 04:27:37.659	f	\N	2026-04-06 04:27:37.66	2026-04-06 04:27:37.66
23	4	1	\N	\N	2500	t	2026-04-06 04:30:29.552	f	\N	2026-04-06 04:30:29.553	2026-04-06 04:30:29.553
24	4	7	\N	\N	2500	t	2026-04-06 04:30:29.563	f	\N	2026-04-06 04:30:29.564	2026-04-06 04:30:29.564
25	4	10	\N	\N	2500	t	2026-04-06 04:30:29.574	f	\N	2026-04-06 04:30:29.575	2026-04-06 04:30:29.575
26	4	17	\N	\N	2500	t	2026-04-06 04:30:29.584	f	\N	2026-04-06 04:30:29.585	2026-04-06 04:30:29.585
27	4	22	\N	\N	2500	t	2026-04-06 04:30:29.595	f	\N	2026-04-06 04:30:29.596	2026-04-06 04:30:29.596
28	4	27	\N	\N	2500	t	2026-04-06 04:30:29.615	f	\N	2026-04-06 04:30:29.615	2026-04-06 04:30:29.615
29	4	32	\N	\N	2500	t	2026-04-06 04:30:29.624	f	\N	2026-04-06 04:30:29.625	2026-04-06 04:30:29.625
30	4	38	\N	\N	2500	t	2026-04-06 04:30:29.634	f	\N	2026-04-06 04:30:29.635	2026-04-06 04:30:29.635
31	4	58	\N	\N	2500	t	2026-04-06 04:30:29.641	f	\N	2026-04-06 04:30:29.641	2026-04-06 04:30:29.641
32	4	48	\N	\N	2500	t	2026-04-06 04:30:29.651	f	\N	2026-04-06 04:30:29.652	2026-04-06 04:30:29.652
33	4	2	\N	\N	0	f	\N	f	\N	2026-04-06 07:04:41.88	2026-04-06 07:04:44.303
34	4	4	\N	\N	1	t	2026-04-06 07:26:06.712	f	\N	2026-04-06 07:26:06.713	2026-04-06 07:26:06.713
35	2	3	\N	\N	1	t	2026-04-06 18:56:53.895	f	\N	2026-04-06 18:56:53.895	2026-04-06 18:56:53.895
36	4	3	\N	\N	1	t	2026-04-07 05:24:37.442	f	\N	2026-04-07 05:24:37.443	2026-04-07 05:24:37.443
37	4	1	\N	\N	2000	t	2026-04-07 05:26:08.606	f	\N	2026-04-07 05:26:08.607	2026-04-07 05:26:08.607
38	2	3	\N	\N	1	t	2026-04-07 14:03:40.331	f	\N	2026-04-07 14:03:40.332	2026-04-07 14:03:40.332
39	2	1	\N	\N	1	t	2026-04-07 14:58:09.51	f	\N	2026-04-07 14:58:09.511	2026-04-07 14:58:09.511
40	2	2	\N	\N	30	t	2026-04-07 15:06:39.555	f	\N	2026-04-07 15:06:38.014	2026-04-07 15:06:39.556
41	2	4	\N	\N	1	t	2026-04-07 15:14:00.713	f	\N	2026-04-07 15:14:00.714	2026-04-07 15:14:00.714
42	2	5	\N	\N	4	t	2026-04-07 15:14:00.727	f	\N	2026-04-07 15:14:00.728	2026-04-07 15:14:00.728
43	2	7	\N	\N	1111	t	2026-04-07 15:16:16.921	f	\N	2026-04-07 15:16:16.922	2026-04-07 15:16:16.922
44	2	32	\N	\N	1111	t	2026-04-07 15:16:16.942	f	\N	2026-04-07 15:16:16.943	2026-04-07 15:16:16.943
45	2	58	\N	\N	1111	t	2026-04-07 15:16:16.953	f	\N	2026-04-07 15:16:16.953	2026-04-07 15:16:16.953
46	4	2	\N	\N	30	t	2026-04-07 17:19:41.083	f	\N	2026-04-07 17:19:39.239	2026-04-07 17:19:41.084
47	4	4	\N	\N	1	t	2026-04-07 17:20:05.608	f	\N	2026-04-07 17:20:05.609	2026-04-07 17:20:05.609
48	4	5	\N	\N	4	t	2026-04-07 17:20:05.618	f	\N	2026-04-07 17:20:05.619	2026-04-07 17:20:05.619
49	4	3	\N	\N	1	t	2026-04-08 04:00:35.663	f	\N	2026-04-08 04:00:35.664	2026-04-08 04:00:35.664
50	4	1	\N	\N	1	t	2026-04-08 04:05:41.74	f	\N	2026-04-08 04:05:41.741	2026-04-08 04:05:41.741
51	4	9	\N	\N	8160	t	2026-04-08 13:59:33.333	f	\N	2026-04-08 13:59:33.334	2026-04-08 13:59:33.334
52	4	5	\N	\N	3	t	2026-04-08 13:59:33.351	f	\N	2026-04-08 13:59:33.352	2026-04-08 13:59:33.352
53	4	13	\N	\N	8160	t	2026-04-08 13:59:33.357	f	\N	2026-04-08 13:59:33.358	2026-04-08 13:59:33.358
54	4	16	\N	\N	8160	t	2026-04-08 13:59:33.366	f	\N	2026-04-08 13:59:33.366	2026-04-08 13:59:33.366
55	4	21	\N	\N	8160	t	2026-04-08 13:59:33.374	f	\N	2026-04-08 13:59:33.374	2026-04-08 13:59:33.374
56	4	26	\N	\N	8160	t	2026-04-08 13:59:33.382	f	\N	2026-04-08 13:59:33.382	2026-04-08 13:59:33.382
57	4	36	\N	\N	8160	t	2026-04-08 13:59:33.39	f	\N	2026-04-08 13:59:33.391	2026-04-08 13:59:33.391
58	4	56	\N	\N	8160	t	2026-04-08 13:59:33.4	f	\N	2026-04-08 13:59:33.401	2026-04-08 13:59:33.401
59	4	66	\N	\N	8160	t	2026-04-08 13:59:33.408	f	\N	2026-04-08 13:59:33.409	2026-04-08 13:59:33.409
60	4	71	\N	\N	8160	t	2026-04-08 13:59:33.416	f	\N	2026-04-08 13:59:33.417	2026-04-08 13:59:33.417
61	4	3	\N	\N	1	t	2026-04-09 06:58:33.635	f	\N	2026-04-09 06:58:33.636	2026-04-09 06:58:33.636
\.


--
-- Data for Name: user_stats; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.user_stats (stat_id, user_id, level, current_exp, total_points, current_streak, last_activity_date) FROM stdin;
3	4	1	495	24	0	2026-04-09
2	3	1	110	5	0	2026-04-06
1	2	1	370	17	1	2026-04-07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: infinityadmin
--

COPY public.users (user_id, email, password, first_name, last_name, role, profile_img, bio, push_token, created_at, updated_at) FROM stdin;
3	mewmc2003@gmail.com	$2b$10$6qxQc.TVMJQgtQrYGn6OnOtmUcJnjd3cB.VYeahH/aiCjnKD9XcmS	Chayanun	Tuntilavasuit	user	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzM5Qko1MFMzOE55Y2diMWFyT29YekREbm5PeSJ9	\N	\N	2026-04-06 04:09:45.943	2026-04-06 04:09:45.943
2	p50148.2013@gmail.com	$2b$10$pBQfkdAEAfl0amBmL.1p3OqzDWnT3Llpi4nXJ5GvJ/CWRRP6wUi8e	Nattan12	Chosungnoen	user	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzNDMjlhOWRPN1E2YmlZZlhTMkg5UkppaUdLayJ9	\N	\N	2026-03-27 14:13:34.092	2026-04-07 14:40:57.988
4	mewmc2003+test0@gmail.com	$2b$10$hoj/ihBlieD2oCbcFrN.O.9Mue6VhU35sIytrGip0qCMXqYlA6VPO	Mew	Tuntilavasuit	user	https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzNCeVJDSlBPR3BRZWhvZlVvTmRXMDVHNFZoWSJ9	\N	\N	2026-04-06 04:25:45.58	2026-04-09 06:58:16.275
1	admin@infinity.com	$2b$10$U0lniB9zsERhjxFlETBFgOBJPWv7rVHoK/xrfbqBgLaK3rtnfT7nG	Super	Admin	admin	\N	\N	\N	2026-03-25 19:24:16.602	2026-04-18 09:40:55.578
\.


--
-- Name: daily_goals_goal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.daily_goals_goal_id_seq', 3, true);


--
-- Name: exercise_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.exercise_categories_category_id_seq', 3, true);


--
-- Name: exercise_videos_video_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.exercise_videos_video_id_seq', 29, true);


--
-- Name: health_tracking_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.health_tracking_tracking_id_seq', 43, true);


--
-- Name: levels_level_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.levels_level_id_seq', 100, true);


--
-- Name: missions_mission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.missions_mission_id_seq', 106, true);


--
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 32, true);


--
-- Name: point_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.point_history_history_id_seq', 1, false);


--
-- Name: routines_routine_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.routines_routine_id_seq', 6, true);


--
-- Name: user_missions_user_mission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.user_missions_user_mission_id_seq', 61, true);


--
-- Name: user_stats_stat_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.user_stats_stat_id_seq', 4, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: infinityadmin
--

SELECT pg_catalog.setval('public.users_user_id_seq', 4, true);


--
-- Name: daily_goals daily_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.daily_goals
    ADD CONSTRAINT daily_goals_pkey PRIMARY KEY (goal_id);


--
-- Name: exercise_categories exercise_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.exercise_categories
    ADD CONSTRAINT exercise_categories_pkey PRIMARY KEY (category_id);


--
-- Name: exercise_videos exercise_videos_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.exercise_videos
    ADD CONSTRAINT exercise_videos_pkey PRIMARY KEY (video_id);


--
-- Name: health_tracking health_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.health_tracking
    ADD CONSTRAINT health_tracking_pkey PRIMARY KEY (tracking_id);


--
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (level_id);


--
-- Name: missions missions_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_pkey PRIMARY KEY (mission_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: point_history point_history_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.point_history
    ADD CONSTRAINT point_history_pkey PRIMARY KEY (history_id);


--
-- Name: routines routines_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.routines
    ADD CONSTRAINT routines_pkey PRIMARY KEY (routine_id);


--
-- Name: user_missions user_missions_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_pkey PRIMARY KEY (user_mission_id);


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (stat_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: user_stats_user_id_key; Type: INDEX; Schema: public; Owner: infinityadmin
--

CREATE UNIQUE INDEX user_stats_user_id_key ON public.user_stats USING btree (user_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: infinityadmin
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: daily_goals daily_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.daily_goals
    ADD CONSTRAINT daily_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: exercise_videos exercise_videos_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.exercise_videos
    ADD CONSTRAINT exercise_videos_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.exercise_categories(category_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: health_tracking health_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.health_tracking
    ADD CONSTRAINT health_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: point_history point_history_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.point_history
    ADD CONSTRAINT point_history_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(mission_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: point_history point_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.point_history
    ADD CONSTRAINT point_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: routines routines_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.routines
    ADD CONSTRAINT routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_missions user_missions_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(mission_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_missions user_missions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_stats user_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: infinityadmin
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict yw6wGnZvqWlINTrI7FqXQ7dBe7ZJzqOk8i2DjZ98MzlpuRK96ok0cyS2HCsQFcn

