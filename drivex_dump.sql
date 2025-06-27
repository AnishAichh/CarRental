--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    renter_id integer,
    vehicle_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'pending'::text,
    pickup_location character varying(255),
    total_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    user_id integer,
    booking_option character varying(20) DEFAULT 'without_driver'::character varying NOT NULL,
    CONSTRAINT bookings_booking_option_check CHECK (((booking_option)::text = ANY ((ARRAY['without_driver'::character varying, 'with_driver'::character varying])::text[])))
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: kyc; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kyc (
    id integer NOT NULL,
    user_id integer,
    full_name text,
    dob date,
    document_type text,
    document_number text,
    document_image_url text,
    selfie_url text,
    status text DEFAULT 'pending'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.kyc OWNER TO postgres;

--
-- Name: kyc_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kyc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kyc_id_seq OWNER TO postgres;

--
-- Name: kyc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kyc_id_seq OWNED BY public.kyc.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title text,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: owner_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.owner_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    full_name character varying(255),
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    admin_notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    phone_number character varying(20),
    email character varying(255),
    address text,
    government_id_type character varying(20),
    government_id_number character varying(50),
    id_image_url text,
    selfie_url text,
    vehicle_type character varying(20),
    brand_model character varying(255),
    registration_number character varying(20),
    year_of_manufacture integer,
    fuel_type character varying(20),
    transmission character varying(20),
    seating_capacity integer,
    vehicle_photo_url text,
    insurance_document_url text,
    rc_document_url text,
    price_per_day numeric(10,2),
    available_from date,
    available_to date,
    driving_license_url text,
    address_proof_url text,
    ownership_declaration text,
    vehicle_info jsonb,
    vehicle_id integer,
    request_type character varying(50) DEFAULT 'owner_application'::character varying NOT NULL,
    CONSTRAINT valid_dates CHECK (((available_to IS NULL) OR (available_to >= available_from))),
    CONSTRAINT valid_fuel_type CHECK (((fuel_type)::text = ANY ((ARRAY['petrol'::character varying, 'diesel'::character varying, 'ev'::character varying])::text[]))),
    CONSTRAINT valid_government_id_type CHECK (((government_id_type)::text = ANY ((ARRAY['aadhar'::character varying, 'pan'::character varying, 'license'::character varying])::text[]))),
    CONSTRAINT valid_phone_number CHECK (((phone_number)::text ~ '^[0-9]{10}$'::text)),
    CONSTRAINT valid_price CHECK ((price_per_day >= (100)::numeric)),
    CONSTRAINT valid_registration_number CHECK (((registration_number)::text ~ '^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$'::text)),
    CONSTRAINT valid_request_type CHECK (((request_type)::text = ANY ((ARRAY['owner_application'::character varying, 'vehicle_addition'::character varying])::text[]))),
    CONSTRAINT valid_seating_capacity CHECK (((seating_capacity >= 1) AND (seating_capacity <= 10))),
    CONSTRAINT valid_status CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[]))),
    CONSTRAINT valid_transmission CHECK (((transmission)::text = ANY ((ARRAY['manual'::character varying, 'automatic'::character varying])::text[]))),
    CONSTRAINT valid_vehicle_type CHECK (((vehicle_type)::text = ANY ((ARRAY['car'::character varying, 'bike'::character varying])::text[]))),
    CONSTRAINT valid_year CHECK (((year_of_manufacture >= 1900) AND ((year_of_manufacture)::numeric <= EXTRACT(year FROM CURRENT_DATE))))
);


ALTER TABLE public.owner_requests OWNER TO postgres;

--
-- Name: COLUMN owner_requests.vehicle_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.owner_requests.vehicle_id IS 'References the vehicle being approved if request_type is vehicle_addition';


--
-- Name: COLUMN owner_requests.request_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.owner_requests.request_type IS 'Type of request: owner_application or vehicle_addition';


--
-- Name: owner_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.owner_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.owner_requests_id_seq OWNER TO postgres;

--
-- Name: owner_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.owner_requests_id_seq OWNED BY public.owner_requests.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    booking_id integer,
    from_user_id integer,
    to_user_id integer,
    amount integer,
    platform_fee integer,
    status text DEFAULT 'completed'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    is_admin boolean DEFAULT false,
    is_kyc_verified boolean DEFAULT false,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['user'::character varying, 'owner'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicle_review_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_review_requests (
    id integer NOT NULL,
    vehicle_id integer,
    owner_id integer,
    status character varying(20) DEFAULT 'pending'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    review_notes text,
    CONSTRAINT vehicle_review_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


ALTER TABLE public.vehicle_review_requests OWNER TO postgres;

--
-- Name: vehicle_review_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_review_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_review_requests_id_seq OWNER TO postgres;

--
-- Name: vehicle_review_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_review_requests_id_seq OWNED BY public.vehicle_review_requests.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    owner_id integer,
    name text,
    brand text,
    type text,
    price_per_day integer NOT NULL,
    image_url text,
    approved boolean DEFAULT false,
    availability boolean DEFAULT true,
    approved_by_admin boolean DEFAULT false,
    status character varying(20) DEFAULT 'pending_approval'::character varying,
    inspection_notes text,
    inspection_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    vehicle_type character varying(20),
    brand_model character varying(255),
    registration_number character varying(20),
    year_of_manufacture integer,
    fuel_type character varying(20),
    transmission character varying(20),
    seating_capacity integer,
    vehicle_photo_url text,
    insurance_document_url text,
    rc_document_url text,
    available_from date,
    available_to date,
    location character varying(255),
    model character varying(255),
    description text,
    features text,
    insurance_details text,
    documents text,
    year integer,
    is_available boolean DEFAULT false,
    CONSTRAINT vehicles_status_check CHECK (((status)::text = ANY ((ARRAY['pending_approval'::character varying, 'approved'::character varying, 'rejected'::character varying, 'pending_physical_verification'::character varying])::text[])))
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: kyc id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc ALTER COLUMN id SET DEFAULT nextval('public.kyc_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: owner_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner_requests ALTER COLUMN id SET DEFAULT nextval('public.owner_requests_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicle_review_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_review_requests ALTER COLUMN id SET DEFAULT nextval('public.vehicle_review_requests_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, renter_id, vehicle_id, start_date, end_date, status, pickup_location, total_amount, created_at, updated_at, user_id, booking_option) FROM stdin;
1	1	1	2025-06-12	2025-06-15	pending	\N	\N	2025-06-14 19:53:27.318915	2025-06-14 19:53:27.318915	\N	without_driver
2	\N	9	2025-10-12	2025-10-22	pending	\N	12000.00	2025-06-15 17:10:11.796419	2025-06-15 17:10:11.796419	15	with_driver
3	\N	9	2025-10-15	2025-10-20	confirmed	\N	6000.00	2025-06-19 00:35:21.163281	2025-06-19 02:45:14.167238	17	without_driver
4	\N	1	2025-11-15	2025-11-20	pending	\N	7500.00	2025-06-19 02:49:41.887958	2025-06-19 02:49:41.887958	17	without_driver
5	\N	9	2025-11-20	2025-11-30	confirmed	\N	12000.00	2025-06-19 11:41:02.551901	2025-06-19 11:42:32.332929	18	without_driver
\.


--
-- Data for Name: kyc; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kyc (id, user_id, full_name, dob, document_type, document_number, document_image_url, selfie_url, status, created_at, updated_at) FROM stdin;
1	3	\N	2001-02-12	aadhar	2515515155	\N	\N	approved	2025-06-11 02:50:14.554684	2025-06-14 19:00:05.077374
6	13	\N	2001-01-31	aadhar	awdawdadwdawc	\N	\N	approved	2025-06-14 00:37:04.199778	2025-06-14 19:00:09.120106
8	15	\N	2001-12-12	aadhar	sdadsdasdasdsa	\N	\N	approved	2025-06-15 12:51:35.630517	2025-06-15 16:26:40.709635
9	16	\N	2001-12-12	aadhar	66516151515	\N	\N	approved	2025-06-15 23:13:51.618367	2025-06-15 23:14:31.45397
11	17	\N	2000-10-04	aadhar	115155151515151	\N	\N	approved	2025-06-18 19:35:22.557153	2025-06-18 19:36:05.671375
12	18	\N	2005-11-04	aadhar	58945485181851	\N	\N	approved	2025-06-19 11:38:36.013933	2025-06-19 11:39:44.128194
13	19	Ranjan Barman	2001-12-12	pan	DQGPA8574A	https://res.cloudinary.com/ddptnjb5i/image/upload/v1750324274/vheego_uploads/file.jpg	https://res.cloudinary.com/ddptnjb5i/image/upload/v1750325759/vheego_uploads/file.jpg	approved	2025-06-19 15:06:02.660329	2025-06-19 15:09:27.619024
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, is_read, created_at) FROM stdin;
1	17	Booking Confirmed!	Your booking for Mercedez Benz GLS 300 is confirmed!\nPickup Info: railgate, 2025-11-23T12:00. ahinjua\n	f	2025-06-19 02:45:14.181354
2	18	Booking Confirmed!	Your booking for Mercedez Benz GLS 300 is confirmed!\nPickup Info: Railgate , 2025-11-20T15:00. Joldi ahi jaba\n	f	2025-06-19 11:42:32.34534
\.


--
-- Data for Name: owner_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.owner_requests (id, user_id, full_name, status, admin_notes, created_at, updated_at, phone_number, email, address, government_id_type, government_id_number, id_image_url, selfie_url, vehicle_type, brand_model, registration_number, year_of_manufacture, fuel_type, transmission, seating_capacity, vehicle_photo_url, insurance_document_url, rc_document_url, price_per_day, available_from, available_to, driving_license_url, address_proof_url, ownership_declaration, vehicle_info, vehicle_id, request_type) FROM stdin;
14	13	Kabir Nath	rejected	\N	2025-06-13 22:51:33.331397+05:30	2025-06-13 23:14:38.414138+05:30	6026758060	\N	\N	aadhar	233232323231	http://localhost:3000/become-owner	http://localhost:3000/become-owner	car	Maruti 800	AS01AB2202	2002	petrol	manual	5	http://localhost:3000/become-owner	http://localhost:3000/become-owner	http://localhost:3000/become-owner	1200.00	2025-07-12	\N	\N	\N	I agree to the terms and conditions.	\N	\N	owner_application
15	13	Kabir Nath	approved	\N	2025-06-13 23:13:07.851483+05:30	2025-06-13 23:15:24.307913+05:30	9876543210	kabirshree@drivex.com	123 Main Street, City, State	aadhar	123456789012	https://example.com/id.jpg	https://example.com/selfie.jpg	car	Toyota Camry	KA01AB1234	2020	petrol	automatic	5	https://example.com/vehicle.jpg	https://example.com/insurance.pdf	https://example.com/rc.pdf	1500.00	2025-06-13	\N	\N	\N	\N	\N	\N	owner_application
13	3	Anish Aich	rejected	\N	2025-06-13 14:19:08.784802+05:30	2025-06-13 23:15:26.810845+05:30	9957898979	\N	\N	aadhar	233232323231	http://localhost:3000/become-owner	http://localhost:3000/become-owner	car	Swift	AS12BY2002	2020	petrol	manual	3	http://localhost:3000/become-owner	http://localhost:3000/become-owner	http://localhost:3000/become-owner	2000.00	2025-06-25	\N	\N	\N	I agree to the terms and conditions.	\N	\N	owner_application
18	15	Shraddha Deka	approved	\N	2025-06-15 17:53:03.632418+05:30	2025-06-15 17:59:29.292328+05:30	9435014933	shraddhadeka@gmail.com	Guwahati	aadhar	www.image.com	www.image.com	www.image.com	car	Ferrari	AS01AS0101	2021	diesel	automatic	2	www.image.com	www.image.com	www.image.com	6000.00	2025-07-12	2026-07-12	\N	\N	\N	\N	\N	owner_application
22	18	Nabajyoti DEka	approved	\N	2025-06-19 11:45:51.982093+05:30	2025-06-19 12:24:32.407671+05:30	9957898979	nabajyotideka@gmail.com	Ward 2 , Railgate No 1\nChandmari , Hazarapar PO	pan	DQGPA8475j	www.image.com	www.image.com	car	BMW 300s	AS01AS0005	2021	diesel	manual	3	www.image.com	www.image.com	www.image.com	3000.00	2025-06-19	2026-06-19	\N	\N	\N	\N	\N	owner_application
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, booking_id, from_user_id, to_user_id, amount, platform_fee, status, created_at) FROM stdin;
1	1	3	2	7500	750	completed	2025-06-11 00:18:45.198228
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, is_admin, is_kyc_verified, role, created_at, updated_at) FROM stdin;
1	Test User	test@example.com	hashedpassword	f	f	user	2025-06-13 22:43:55.749864+05:30	2025-06-13 22:43:55.749864+05:30
2	Admin User	admin@example.com	hashedadminpass	t	f	user	2025-06-13 22:43:55.749864+05:30	2025-06-13 22:43:55.749864+05:30
5	Admin	adminanish@example.com	$2a$10$9iOKwLoVIfV2B9lHoTktsu9g1Qd3YHKpxJ.5hnF.YBSEqjKpcKbyi	t	f	user	2025-06-13 22:43:55.749864+05:30	2025-06-13 22:43:55.749864+05:30
3	Anish Aich	anishaich4@gmail.com	$2b$10$ayQqDx0fmaOr6efdYZrNRu1Kz1oOMcD1ajr.p.Wjbn4B8IT47tWaG	f	t	user	2025-06-13 22:43:55.749864+05:30	2025-06-13 22:43:55.749864+05:30
12	Kabir Nath	kabirshree01@gmail.com	$2b$10$foh5dz0cIeRBpigae/br.Ou4ZHFvhWQCXd9wyq3kNAoIlXNXoeCy2	f	f	user	2025-06-13 22:44:48.989036+05:30	2025-06-13 22:44:48.989036+05:30
13	Kabir Nath	kabirshree@drivex.com	$2b$10$StswKsPJAXxnxuU5hu9GqORGjtshfqi7CgZJgZx0waiVWOd7eVzcG	f	t	owner	2025-06-13 22:48:33.37904+05:30	2025-06-14 19:00:09.120106+05:30
14	Yuvraj Deka	yuvrajdeka@gmail.com	$2b$10$W2/J161/yU8Ayp6Mak3BTeZXY.7J/knRyf3gefgGYWcc5.q1RVzA6	f	f	user	2025-06-15 03:59:10.837891+05:30	2025-06-15 03:59:10.837891+05:30
11	Admin	admin@drivex.com	$2b$10$98WksXSP0NE3prheKA8jp.H8sQTigyyZ8HHnA6DKwEFV/p1sZKtV6	t	f	admin	2025-06-13 22:43:55.749864+05:30	2025-06-15 16:54:34.978975+05:30
15	Shraddha Deka	shraddhadeka@gmail.com	$2b$10$OKmOQ7z/WWVhOwmoJzR0OeqvUON8AXeXRNM100QtH6kJSmIqeGh8i	f	t	owner	2025-06-15 04:07:48.33674+05:30	2025-06-15 17:59:29.292328+05:30
16	Udipon Kalita	udi@gmail.com	$2b$10$kfowjbNSrctwxQ5.dwuV1O4sQoQYNcfQlbWlZT385AYZn93O/.3gG	f	t	user	2025-06-15 23:12:01.584549+05:30	2025-06-15 23:14:31.45397+05:30
17	Hiya Deka	hiyadeka@gmail.com	$2b$10$bkZ3cKQm2fGoMYgMe4u9l.FnhiBS/wTYBp8TVb6vt0K6Zc.9JiivG	f	t	user	2025-06-18 19:34:37.561531+05:30	2025-06-18 19:36:05.671375+05:30
18	Nabajyoti Deka	nabajyotideka@gmail.com	$2b$10$HI/uMBk2m7LCTYDGVyhe7OkEkGEC3LBLFFpjq87458.LAGS9YAwgW	f	t	owner	2025-06-19 11:37:02.883372+05:30	2025-06-19 12:24:32.407671+05:30
19	Ranjan Barman	ranjanbarman@gmail.com	$2b$10$zsk4BgQ.68575zifepscF.SVS.ZhwqUkfD4sWyuufSmclGltdKHxO	f	t	user	2025-06-19 14:58:48.826164+05:30	2025-06-19 15:09:27.619024+05:30
\.


--
-- Data for Name: vehicle_review_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_review_requests (id, vehicle_id, owner_id, status, notes, created_at, updated_at, review_notes) FROM stdin;
1	5	1	pending	\N	2025-06-11 18:23:23.53667	2025-06-11 18:23:23.53667	\N
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, owner_id, name, brand, type, price_per_day, image_url, approved, availability, approved_by_admin, status, inspection_notes, inspection_date, created_at, updated_at, vehicle_type, brand_model, registration_number, year_of_manufacture, fuel_type, transmission, seating_capacity, vehicle_photo_url, insurance_document_url, rc_document_url, available_from, available_to, location, model, description, features, insurance_details, documents, year, is_available) FROM stdin;
11	13	Honda City	\N	\N	1200	www.image.com	f	t	t	approved	\N	\N	2025-06-15 23:25:31.821678	2025-06-18 20:44:25.279665	\N	\N	AS01BB2002	\N	\N	\N	\N	\N	\N	\N	\N	\N	Guwahati	Toyota Camry			https://example.com/insurance.pdf	https://example.com/rc.pdf	2020	t
5	1	Test Vehicle	Toyota	Sedan	50	https://example.com/camry.jpg	f	f	f	pending_approval	\N	\N	2025-06-11 18:22:45.646585	2025-06-11 18:22:45.646585	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
7	3	\N	\N	\N	2000	\N	f	t	f	pending_approval	\N	\N	2025-06-13 14:19:08.784802	2025-06-13 14:19:08.784802	car	Swift	AS12BY2002	2020	petrol	manual	3	http://localhost:3000/become-owner	http://localhost:3000/become-owner	http://localhost:3000/become-owner	2025-06-25	\N	\N	\N	\N	\N	\N	\N	\N	f
1	1	Swift	Maruti	Car	1500	https://link-to-image.com/swift.jpg	t	t	t	approved	\N	\N	2025-06-11 18:05:33.844173	2025-06-15 05:19:43.40335	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Tezpur	\N	\N	\N	\N	\N	\N	f
8	13	Maruti 800	\N	\N	1200	\N	f	t	t	approved	\N	\N	2025-06-13 22:51:33.331397	2025-06-15 05:24:12.01764	car	Maruti 800	AS01AB2202	2002	petrol	manual	5	http://localhost:3000/become-owner	http://localhost:3000/become-owner	http://localhost:3000/become-owner	2025-07-12	\N	\N	\N	\N	\N	\N	\N	\N	f
9	13	Mercedez Benz GLS 300	\N	\N	1200	http://localhost:3000/dashboard/owner/vehicles/new?user=	t	t	t	approved	\N	\N	2025-06-15 03:32:09.2504	2025-06-15 16:56:22.763524	\N	\N	AS12BB2002	\N	\N	\N	\N	\N	\N	\N	\N	\N	Tezpur	Toyota Camry			https://example.com/insurance.pdf	https://example.com/rc.pdf	2020	f
10	15	Ferrari	\N	\N	6000	www.image.com	f	t	t	pending_approval	\N	\N	2025-06-15 17:59:29.292328	2025-06-15 23:32:05.393346	\N	\N	AS01AS0101	\N	\N	\N	\N	\N	\N	\N	\N	\N	Guwahati	Ferrari	car - Ferrari	Type: car, Fuel: diesel, Transmission: automatic, Seats: 2	www.image.com	www.image.com	2021	f
17	13	Kabir Nath	\N	\N	5151	http://localhost:3000/dashboard/owner/vehicles/new?user=	f	t	f	approved	\N	\N	2025-06-16 03:37:05.97197	2025-06-18 20:44:05.448948	\N	\N	AS12BB2002sdadsdad	\N	\N	\N	\N	\N	\N	\N	\N	\N	Guwahati	Toyota Camry			https://example.com/insurance.pdf	https://example.com/rc.pdf	2020	t
16	13	sads	\N	\N	2646	sdadasd	f	t	f	approved	\N	\N	2025-06-16 03:16:36.704489	2025-06-18 20:44:19.376124	\N	\N	AS12BB2002sdad	\N	\N	\N	\N	\N	\N	\N	\N	\N	Guwahati	Toyota Camry			https://example.com/insurance.pdf	https://example.com/rc.pdf	2020	t
15	13	Honda civic 	\N	\N	1800	https://www.google.com/search?sca_esv=b5163d8851d952ee&rlz=1C1CHZN_enIN1022IN1022&q=speedtest&udm=2&fbs=AIIjpHxU7SXXniUZfeShr2fp4giZ1Y6MJ25_tmWITc7uy4KIemkjk18Cn72Gp24fGkjjh6xc8y8oU3IJovU34XDyOFvEl9PQhCX-bXyx8AzQGU_JUrAkvtyeP3IYyqtEXRl3ULRru5NxUZaQ-Hq0t_KkNK_8fBm2IrXPls5s33-DK_VI9Px1LtSs9WX9Mh3YpHJTpt8VI1DWTKO4sRLw6Rvxywc4Wls-VA&sa=X&sqi=2&ved=2ahUKEwiknNDbx_CNAxXnR2wGHSzMItAQtKgLegQIEhAB&biw=2048&bih=903&dpr=0.94#vhid=-PAr88wgZaZ7hM&vssid=mosaic	f	t	f	approved	\N	\N	2025-06-16 03:06:23.735724	2025-06-18 20:44:23.205956	\N	\N	AS01BB2025	\N	\N	\N	\N	\N	\N	\N	\N	\N	Tezpur	Toyota Camry			https://example.com/insurance.pdf	https://example.com/rc.pdf	2020	t
18	18	Honda Accord	\N	\N	2000	www.image.com	f	t	t	approved	\N	\N	2025-06-19 12:28:53.708752	2025-06-19 14:04:14.190786	\N	\N	AS01BB2000	\N	\N	\N	\N	\N	\N	\N	\N	\N	Tezpur	BMW 300s			www.image.com	www.image.com	2021	t
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 5, true);


--
-- Name: kyc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kyc_id_seq', 14, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 2, true);


--
-- Name: owner_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.owner_requests_id_seq', 22, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 19, true);


--
-- Name: vehicle_review_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_review_requests_id_seq', 1, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 18, true);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: kyc kyc_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc
    ADD CONSTRAINT kyc_pkey PRIMARY KEY (id);


--
-- Name: kyc kyc_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc
    ADD CONSTRAINT kyc_user_id_key UNIQUE (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: owner_requests owner_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner_requests
    ADD CONSTRAINT owner_requests_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicle_review_requests vehicle_review_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_review_requests
    ADD CONSTRAINT vehicle_review_requests_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: idx_owner_requests_registration; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_owner_requests_registration ON public.owner_requests USING btree (registration_number);


--
-- Name: idx_owner_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_owner_requests_status ON public.owner_requests USING btree (status);


--
-- Name: idx_owner_requests_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_owner_requests_user_id ON public.owner_requests USING btree (user_id);


--
-- Name: idx_owner_requests_vehicle_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_owner_requests_vehicle_id ON public.owner_requests USING btree (vehicle_id);


--
-- Name: idx_vehicle_review_requests_vehicle_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vehicle_review_requests_vehicle_id ON public.vehicle_review_requests USING btree (vehicle_id);


--
-- Name: owner_requests set_owner_requests_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_owner_requests_updated_at BEFORE UPDATE ON public.owner_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vehicle_review_requests update_vehicle_review_requests_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_vehicle_review_requests_updated_at BEFORE UPDATE ON public.vehicle_review_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vehicles update_vehicles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bookings bookings_renter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_renter_id_fkey FOREIGN KEY (renter_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bookings bookings_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: kyc kyc_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc
    ADD CONSTRAINT kyc_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: owner_requests owner_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner_requests
    ADD CONSTRAINT owner_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: owner_requests owner_requests_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner_requests
    ADD CONSTRAINT owner_requests_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicle_review_requests vehicle_review_requests_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_review_requests
    ADD CONSTRAINT vehicle_review_requests_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: vehicle_review_requests vehicle_review_requests_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_review_requests
    ADD CONSTRAINT vehicle_review_requests_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: vehicles vehicles_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

