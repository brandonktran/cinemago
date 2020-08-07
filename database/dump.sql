--
-- PostgreSQL database dump
--

-- Dumped from database version 10.12 (Ubuntu 10.12-0ubuntu0.18.04.1)
-- Dumped by pg_dump version 10.12 (Ubuntu 10.12-0ubuntu0.18.04.1)

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

ALTER TABLE public.users ALTER COLUMN "userId" DROP DEFAULT;
ALTER TABLE public.reviews ALTER COLUMN "reviewId" DROP DEFAULT;
ALTER TABLE public.lists ALTER COLUMN "listId" DROP DEFAULT;
DROP SEQUENCE public."users_userId_seq";
DROP TABLE public.users;
DROP SEQUENCE public."reviews_reviewId_seq";
DROP TABLE public.reviews;
DROP TABLE public.movies;
DROP TABLE public.messages;
DROP SEQUENCE public."lists_listId_seq";
DROP TABLE public.lists;
DROP TABLE public."listItems";
DROP EXTENSION plpgsql;
DROP SCHEMA public;
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: listItems; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."listItems" (
    "listId" integer NOT NULL,
    "movieId" integer NOT NULL
);


--
-- Name: lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lists (
    "userId" integer NOT NULL,
    "listId" integer NOT NULL,
    type text NOT NULL,
    name text NOT NULL
);


--
-- Name: lists_listId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."lists_listId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lists_listId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."lists_listId_seq" OWNED BY public.lists."listId";


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    "senderId" integer NOT NULL,
    "recipientId" integer NOT NULL,
    content text NOT NULL,
    "sentAt" timestamp without time zone
);


--
-- Name: movies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movies (
    title text NOT NULL,
    "movieId" integer NOT NULL,
    description text NOT NULL,
    "posterURL" text NOT NULL,
    reviews json NOT NULL,
    "releaseDate" text NOT NULL
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    "userId" integer NOT NULL,
    "reviewId" integer NOT NULL,
    rating integer NOT NULL,
    content text,
    "movieId" integer NOT NULL
);


--
-- Name: reviews_reviewId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."reviews_reviewId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reviews_reviewId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."reviews_reviewId_seq" OWNED BY public.reviews."reviewId";


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    "userId" integer NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    bio text,
    "imageURL" text,
    email text NOT NULL
);


--
-- Name: users_userId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."users_userId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_userId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."users_userId_seq" OWNED BY public.users."userId";


--
-- Name: lists listId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lists ALTER COLUMN "listId" SET DEFAULT nextval('public."lists_listId_seq"'::regclass);


--
-- Name: reviews reviewId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews ALTER COLUMN "reviewId" SET DEFAULT nextval('public."reviews_reviewId_seq"'::regclass);


--
-- Name: users userId; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN "userId" SET DEFAULT nextval('public."users_userId_seq"'::regclass);


--
-- Data for Name: listItems; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."listItems" ("listId", "movieId") FROM stdin;
1	299536
2	299534
2	299536
3	15016
30	27205
35	27205
\.


--
-- Data for Name: lists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lists ("userId", "listId", type, name) FROM stdin;
1	1	favorites	My Favorites
1	2	watch	My Watch List
2	3	favorites	My Favorites
2	4	watch	My Watch List
2	30	custom	Cool Movies
10	31	watch	My Watch List
10	32	favorites	My Favorites List
11	33	watch	My Watch List
11	34	favorites	My Favorites List
12	35	watch	My Watch List
12	36	favorites	My Favorites List
12	37	custom	Cool Movies
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages ("senderId", "recipientId", content, "sentAt") FROM stdin;
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movies (title, "movieId", description, "posterURL", reviews, "releaseDate") FROM stdin;
Inception	27205	Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person's idea into a target's subconscious.	/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg	{"reviews":"not yet"}	2010-07-15
Avengers: Infinity War	299536	As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.	/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg	{"reviews":"not yet"}	2018-04-25
Avengers: Endgame	299534	After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.	/or06FN3Dka5tukK1e9sl16pB3iy.jpg	{"reviews":"not yet"}	2019-04-24
Barbie of Swan Lake	15016	Barbie as Odette, the young daughter of a baker, follows a unicorn into the Enchanted Forest and is transformed into a swan by an evil wizard intent on defeating the Fairy Queen.	/sLpCLVQWTU7BI4yAL6kIFM9J3eX.jpg	{"reviews":"not yet"}	2003-09-28
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews ("userId", "reviewId", rating, content, "movieId") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users ("userId", name, password, bio, "imageURL", email) FROM stdin;
1	Uzair	anime	I like anime and fast cars. nuff said	\N	uzair@gmail.com
2	Cody	coding	I like coding and teaching. nuff said	\N	cody@gmail.com
\.


--
-- Name: lists_listId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."lists_listId_seq"', 37, true);


--
-- Name: reviews_reviewId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."reviews_reviewId_seq"', 1, false);


--
-- Name: users_userId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."users_userId_seq"', 12, true);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

