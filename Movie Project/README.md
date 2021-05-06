# How Does Budget Correlate To Profitability?

## Table of Contents
  * [Description](#Description)
  * [Language/Technoligies Used](#Language/Technologies-Used)  
  * [Findings](#Findings)


## Description 
Using movies from 2015-2019, this task examines three main questions:
  * Does a higher budget determine how lucrative a movie’s profit will be? 
  * Do we find a correlation when we look at the top 3 genres? 
  * Is there a difference between the US and internationally? 



## Language/Technologies Used
* Python 
    * Pandas
    * Numpy
    * Matplotlib
    * SciPy


# Findings 
We found no correlation between budget and profitability. Instead, the scatter plot revealed most movies were made under a 60-million-dollar budget. Also, most of the higher profits were movies made at or less than a 60-million-dollar budget.

We identified the top 3 most lucrative genres:
  * Drama (126 movies)
  * Action (112 movies)
  *  Comedy (91 movies)
 
Drama and Comedy were similar, with most movies made under a 60-million-dollar budget and very few over that budget. We see the same trend of higher profits under a 60-million-dollar budget. 

The Action scatter plot was more scattered. We see higher budgets, and while we do see higher profits with higher budgets, we also see higher profits in lower budgets. Therefore, none of the genres had a correlation between budget and profit.

Having no difference in the top 3 genres, we wondered if there was a difference in the US and International countries. Both returned no correlation, the US with a 0.29 correlation, and International resulted in a lower 0.07 correlation. The difference we did see is that in the US, we spend more on movies than international countries. In the US, we see high profits in low and high movies while in International countries, we only see the higher profits in budgets below 100-million-dollars.

