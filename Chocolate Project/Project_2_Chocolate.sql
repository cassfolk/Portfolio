-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- Link to schema: https://app.quickdatabasediagrams.com/#/d/4ZXilY
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE "id_df" (
    "ID" INT   NOT NULL,
    "review_date" INT   NOT NULL,
    CONSTRAINT "pk_id_df" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE "dependency_chart" (
    "ID" INT   NOT NULL,
    "company_location" VARCHAR(100)   NOT NULL,
    "country_of_bean_origin" VARCHAR(100)   NOT NULL,
    CONSTRAINT "pk_dependency_chart" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE "scatterplot_chart" (
    "ID" INT   NOT NULL,
    "company_location" VARCHAR(100)   NOT NULL,
    "country_of_bean_origin" VARCHAR(100)   NOT NULL,
    "rating" DECIMAL   NOT NULL,
    CONSTRAINT "pk_scatterplot_chart" PRIMARY KEY (
        "ID"
     )
);

CREATE TABLE "donut_chart" (
    "ID" INT   NOT NULL,
    "company_location" VARCHAR(100)   NOT NULL,
    "cocoa_percent" INT   NOT NULL,
    "rating" DECIMAL   NOT NULL,
    CONSTRAINT "pk_donut_chart" PRIMARY KEY (
        "ID"
     )
);

ALTER TABLE "dependency_chart" ADD CONSTRAINT "fk_dependency_chart_ID" FOREIGN KEY("ID")
REFERENCES "id_df" ("ID");

ALTER TABLE "scatterplot_chart" ADD CONSTRAINT "fk_scatterplot_chart_ID" FOREIGN KEY("ID")
REFERENCES "id_df" ("ID");

ALTER TABLE "donut_chart" ADD CONSTRAINT "fk_donut_chart_ID" FOREIGN KEY("ID")
REFERENCES "id_df" ("ID");


-- creating the top 10 countries for donut chart
create table public.donut_top10
as
select
company_location,
cocoa_percent,
count(company_location) count_location,
round(avg(rating),3) rating
from public.donut_chart
where cocoa_percent='70'
group by company_location,
cocoa_percent
ORDER BY count(company_location) DESC
LIMIT 10;
commit;

select
*
from public.donut_top10

Alter Table donut_top10
Add id_num Serial
ALTER TABLE donut_top10
Add CONSTRAINT PK_dependency_num PRIMARY KEY (id_num)


-- craeting the a single row per company_location to country_of... with the count of how many instances each pair had 
ALTER TABLE dependency_chart 
add value_num int NOT NULL DEFAULT 1 

create table public.dependency_num
as
select
company_location, 
country_of_bean_origin,
count(value_num) sum_num
from dependency_chart
Group By company_location, country_of_bean_origin
ORDER BY company_location, country_of_bean_origin
;
commit;

select * from dependency_num

Alter Table dependency_num
Add id_num Serial

ALTER TABLE dependency_num
Add CONSTRAINT PK_dependency_num PRIMARY KEY (id_num)

