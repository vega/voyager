# Sources

Still incomplete. See https://github.com/vega/vega-datasets/issues/15

## `7zip.png`, `ffox.png`, `gimp.png`

Application icons from open-source software projects.

## `annual-precip.json`

A raster grid of global annual precipitation for the year 2016 at a resolution 1 degree of lon/lat per cell, from [CFSv2](https://www.ncdc.noaa.gov/data-access/model-data/model-datasets/climate-forecast-system-version2-cfsv2).

## `airports.csv`

## `anscombe.json`

Graphs in Statistical Analysis, F. J. Anscombe, The American Statistician

## `barley.json`

The result of a 1930s agricultural experiment in Minnesota, this dataset contains yields for 10 different varieties of barley at six different sites. It was first published by agronomists F.R. Immer, H.K. Hayes, and L. Powers in the 1934 paper "Statistical Determination of Barley Varietal Adaption." R.A. Fisher's popularized its use in the field of statistics when he included it in his book ["The Design of Experiments."](https://en.wikipedia.org/wiki/The_Design_of_Experiments) Since then it has been used to demonstrate new statistical techniques, including the [trellis charts](http://ml.stat.purdue.edu/stat695t/writings/TrellisDesignControl.pdf) developed by Richard Becker, William Cleveland and others in the 1990s.

## `birdstrikes.json`

http://wildlife.faa.gov

## `budget.json`

## `budgets.json`

## `burtin.json`

## `cars.json`

http://lib.stat.cmu.edu/datasets/

## `climate.json`

## `co2-concentration.csv`

http://scrippsco2.ucsd.edu/data/atmospheric_co2/primary_mlo_co2_record but modified to only include date and CO2 for months with valid data.

## `countries.json`

## `crimea.json`

## `disasters.csv`

https://ourworldindata.org/natural-catastrophes

## `driving.json`

https://archive.nytimes.com/www.nytimes.com/imagepages/2010/05/02/business/02metrics.html

## `earthquakes.json`

https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson
(Feb 6, 2018)

## `flare.json`

## `flights-?k.json`, `flights-200k.arrow`, `flights-airport.csv`

Flight delay statistics from U.S. Bureau of Transportation Statistics, https://www.transtats.bts.gov/OT_Delay/OT_DelayCause1.asp.

Transformed using /scripts/flights.js

## `gapminder-health-income.csv`, `gapminder.json`

## `github.csv`

Generated using /scripts/github.py

## `population_engineers_hurricanes.csv`

Data about engineers from https://www.bls.gov/oes/tables.htm. Hurricane data from http://www.nhc.noaa.gov/paststate.shtml. Income data from https://factfinder.census.gov/faces/tableservices/jsf/pages/productview.xhtml?pid=ACS_07_3YR_S1901&prodType=table.

## `graticule.json`

Generated using the `-graticule` console option of http://mapshaper.org

## `iowa-electricity.csv`

The state of Iowa has dramatically increased its production of renewable wind power in recent years. This file contains the annual net generation of electricity in the state by source in thousand megawatthours. The dataset was compiled by the [U.S. Energy Information Administration](https://www.eia.gov/beta/electricity/data/browser/#/topic/0?agg=2,0,1&fuel=vvg&geo=00000g&sec=g&linechart=ELEC.GEN.OTH-IA-99.A~ELEC.GEN.COW-IA-99.A~ELEC.GEN.PEL-IA-99.A~ELEC.GEN.PC-IA-99.A~ELEC.GEN.NG-IA-99.A~~ELEC.GEN.NUC-IA-99.A~ELEC.GEN.HYC-IA-99.A~ELEC.GEN.AOR-IA-99.A~ELEC.GEN.HPS-IA-99.A~&columnchart=ELEC.GEN.ALL-IA-99.A&map=ELEC.GEN.ALL-IA-99.A&freq=A&start=2001&end=2017&ctype=linechart&ltype=pin&tab=overview&maptype=0&rse=0&pin=) and downloaded on May 6, 2018. It is useful for illustrating stacked area charts.

## `iris.json`

## `jobs.json`

## `la-riots.csv`

More than 60 people lost their lives amid the looting and fires that ravaged Los Angeles for five days starting on April 29, 1992. This file contains metadata about each person, including the geographic coordinates of their death. It was compiled and published by the [Los Angeles Times Data Desk](http://spreadsheets.latimes.com/la-riots-deaths/).

## `londonBoroughs.json`

Boundaries of London boroughs reprojected and simplified from `London_Borough_Excluding_MHW` shapefile held at https://data.london.gov.uk/dataset/statistical-gis-boundary-files-london. Original data "contains National Statistics data © Crown copyright and database right (2015)" and "Contains Ordnance Survey data © Crown copyright and database right [2015].

## `londonCentroids.json`

Calculated from `londongBoroughs.json` using `d3.geoCentroid`.

## `londonTubeLines.json`

Selected rail lines simplified from `tfl_lines.json` at https://github.com/oobrien/vis/tree/master/tube/data

## `miserables.json`

## `monarchs.json`

## `movies.json`

The dataset has well known and intentionally included errors. This dataset is used for instructional purposes, including the need to reckon with dirty data.

## `ohlc.json`

This dataset contains the performance of the Chicago Board Options Exchange [Volatility Index](https://en.wikipedia.org/wiki/VIX) ([VIX](https://finance.yahoo.com/chart/%5EVIX?ltr=1#eyJpbnRlcnZhbCI6ImRheSIsInBlcmlvZGljaXR5IjoxLCJ0aW1lVW5pdCI6bnVsbCwiY2FuZGxlV2lkdGgiOjgsInZvbHVtZVVuZGVybGF5Ijp0cnVlLCJhZGoiOnRydWUsImNyb3NzaGFpciI6dHJ1ZSwiY2hhcnRUeXBlIjoibGluZSIsImV4dGVuZGVkIjpmYWxzZSwibWFya2V0U2Vzc2lvbnMiOnt9LCJhZ2dyZWdhdGlvblR5cGUiOiJvaGxjIiwiY2hhcnRTY2FsZSI6ImxpbmVhciIsInN0dWRpZXMiOnsidm9sIHVuZHIiOnsidHlwZSI6InZvbCB1bmRyIiwiaW5wdXRzIjp7ImlkIjoidm9sIHVuZHIiLCJkaXNwbGF5Ijoidm9sIHVuZHIifSwib3V0cHV0cyI6eyJVcCBWb2x1bWUiOiIjMDBiMDYxIiwiRG93biBWb2x1bWUiOiIjRkYzMzNBIn0sInBhbmVsIjoiY2hhcnQiLCJwYXJhbWV0ZXJzIjp7IndpZHRoRmFjdG9yIjowLjQ1LCJjaGFydE5hbWUiOiJjaGFydCJ9fX0sInBhbmVscyI6eyJjaGFydCI6eyJwZXJjZW50IjoxLCJkaXNwbGF5IjoiXlZJWCIsImNoYXJ0TmFtZSI6ImNoYXJ0IiwidG9wIjowfX0sInNldFNwYW4iOnt9LCJsaW5lV2lkdGgiOjIsInN0cmlwZWRCYWNrZ3JvdWQiOnRydWUsImV2ZW50cyI6dHJ1ZSwiY29sb3IiOiIjMDA4MWYyIiwiZXZlbnRNYXAiOnsiY29ycG9yYXRlIjp7ImRpdnMiOnRydWUsInNwbGl0cyI6dHJ1ZX0sInNpZ0RldiI6e319LCJzeW1ib2xzIjpbeyJzeW1ib2wiOiJeVklYIiwic3ltYm9sT2JqZWN0Ijp7InN5bWJvbCI6Il5WSVgifSwicGVyaW9kaWNpdHkiOjEsImludGVydmFsIjoiZGF5IiwidGltZVVuaXQiOm51bGwsInNldFNwYW4iOnt9fV19)) in the summer of 2009.

## `points.json`

## `population.json`

## `seattle-temps.csv`

30-year temperature averages recorded hourly from the Seattle Tacoma International Airport weather station.  Data from [NOAA](https://www.ncdc.noaa.gov/cdo-web/datasets/NORMAL_HLY/stations/GHCND:USW00024233/detail).

## `sf-temps.csv`

30-year temperature averages recorded hourly from the San Francisco International Airport weather station.  Data from [NOAA](https://www.ncdc.noaa.gov/cdo-web/datasets/NORMAL_HLY/stations/GHCND:USW00023234/detail).

## `seattle-weather.csv`

Data from [NOAA](http://www.ncdc.noaa.gov/cdo-web/datatools/findstation).

Transformed using /scripts/weather.py

We synthesized the categorical "weather" field from multiple fields in the original dataset. This data is intended for instructional purposes.

## `sp500.csv`

## `stocks.csv`

## `unemployment-across-industries.json`

## `unemployment.tsv`

## `us-10m.json`

## `us-employment.csv`

In the mid 2000s the global economy was hit by a crippling recession. One result: Massive job losses across the United States. The downturn in employment, and the slow recovery in hiring that followed, was tracked each month by the [Current Employment Statistics](https://www.bls.gov/ces/) program at the U.S. Bureau of Labor Statistics.

This file contains the monthly employment total in a variety of job categories from January 2006 through December 2015. The numbers are seasonally adjusted and reported in thousands. The data were downloaded on Nov. 11, 2018, and reformatted for use in this library.

Totals are included for the [22 "supersectors"](https://download.bls.gov/pub/time.series/ce/ce.supersector) tracked by the BLS. The "nonfarm" total is the category typically used by economists and journalists as a stand-in for the country's employment total.

A calculated "nonfarm_change" column has been appended with the month-to-month change in that supersector's employment. It is useful for illustrating how to make bar charts that report both negative and positive values.

## `volcano.json`

Maunga Whau (Mt Eden) is one of about 50 volcanos in the Auckland volcanic field. This data set gives topographic information for Maunga Whau on a 10m by 10m grid. Digitized from a topographic map by Ross Ihaka, adapted from [R datasets](https://stat.ethz.ch/R-manual/R-patched/library/datasets/html/volcano.html). These data should not be regarded as accurate.

## `weather.json`

## `weather.csv`

NOAA

## `weball26.json`

## `wheat.json`

In an 1822 letter to Parliament, [William Playfair](https://en.wikipedia.org/wiki/William_Playfair), a Scottish engineer who is often credited as the founder of statistical graphics, published [an elegant chart on the price of wheat](http://dh101.humanities.ucla.edu/wp-content/uploads/2014/08/Vis_2.jpg). It plots 250 years of prices alongside weekly wages and the reigning monarch. He intended to demonstrate that “never at any former period was wheat so cheap, in proportion to mechanical labour, as it is at the present time.”

## `windvectors.csv`

Simulated wind patterns over northwestern Europe.

## `world-110m.json`

## `zipcodes.csv`

GeoNames.org
