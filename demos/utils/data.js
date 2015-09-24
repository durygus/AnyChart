var products_data = [
  ['Rouge', '80540'],
  ['Foundation', '94190'],
  ['Mascara', '102610'],
  ['Lip gloss', '110430'],
  ['Pomade', '128000'],
  ['Nail polish', '143760'],
  ['Eyebrow pencil', '170670'],
  ['Eyeliner', '213210'],
  ['Eyeshadows', '249980']
];

var categorized_data = anychart.data.set([
  ['Nail polish', 12814, 3054, 4376, 4229],
  ['Eyebrow pencil', 13012, 5067, 3987, 3932],
  ['Rouge', 11624, 7004, 3574, 5221],
  ['Pomade', 8814, 9054, 4376, 9256],
  ['Eyeshadows', 12998, 12043, 4572, 3308],
  ['Eyeliner', 12321, 15067, 3417, 5432],
  ['Foundation', 10342, 10119, 5231, 13701],
  ['Lip gloss', 22998, 12043, 4572, 4008],
  ['Mascara', 11261, 10419, 6134, 18712]
]);

var categorized_small_data = anychart.data.set([
  ['Nail polish', 6814, 3054, 4376, 4229],
  ['Eyebrow pencil', 7012, 5067, 8987, 3932],
  ['Pomade', 8814, 9054, 4376, 9256]
]);

var sales_by_months_data = anychart.data.set([
  ['Jan.', 80540],
  ['Feb.', 94190],
  ['Mar.', 102610],
  ['Apr.', 110430],
  ['May', 128000],
  ['June', 143760],
  ['July', 170670],
  ['Aug.', 213210],
  ['Sep.', 249980],
  ['Oct.', 259680],
  ['Nov.', 240980],
  ['Dec.', 229580]
]);
var sales_by_months_data_bubble = anychart.data.set([
  ['Jan.', 80540, 4],
  ['Feb.', 94190, 5],
  ['Mar.', 102610, 9],
  ['Apr.', 110430, 12],
  ['May', 128000, 4],
  ['June', 143760, 3],
  ['July', 170670, 7],
  ['Aug.', 213210, 8],
  ['Sep.', 249980, 5],
  ['Oct.', 259680, 10],
  ['Nov.', 240980, 4],
  ['Dec.', 229580, 6]
]);
var sales_by_months_data_bubble_categorized = anychart.data.set([
  ['Jan.', 80540, 65320, 4, 7],
  ['Feb.', 94190, 73320, 5, 2],
  ['Mar.', 102610, 83320, 9, 8],
  ['Apr.', 110430, 98320, 12, 7],
  ['May', 128000, 125932, 4, 5],
  ['June', 143760, 125932, 3, 2],
  ['July', 170670, 125932, 7, 8],
  ['Aug.', 213210, 98320, 8, 4],
  ['Sep.', 249980, 125932, 5, 6],
  ['Oct.', 259680, 100320, 10, 4],
  ['Nov.', 240980, 125932, 4, 3],
  ['Dec.', 229580, 103320, 6, 8]
]);
var sales_in_quater = anychart.data.set([
  ['Sep.', 249980],
  ['Oct.', 259680],
  ['Nov.', 240980]
]);

var radar_data = anychart.data.set([
  ['Marketing', 250, 234],
  ['Promotion\ncampaigns', 250, 190],
  ['Logistics', 340, 320],
  ['Customer\nsupport', 110, 210],
  ['Engineering\nresearch', 200, 170]
]);

var sales_by_months_data_categorized = anychart.data.set([
  ['Jan.', 100540, 65320, 80540, 39320, 20040, 139320, 110040, 30020, 120940, 155320],
  ['Feb.', 104190, 73320, 124190, 63320, 21190, 163320, 144190, 30320, 194190, 173320],
  ['Mar.', 92910, 83320, 132610, 73320, 22610, 125932, 202610, 31320, 212610, 183320],
  ['Apr.', 140430, 86320, 150930, 76320, 24430, 197389, 280430, 36320, 220430, 186320],
  ['May', 108000, 98320, 143900, 48320, 28000, 200320, 258000, 38320, 238000, 188320],
  ['June', 123760, 103320, 143760, 63320, 25760, 173320, 243760, 33320, 213760, 125932],
  ['July', 130670, 100320, 140670, 90320, 20670, 180320, 270670, 125932, 200670, 210320],
  ['Aug.', 143210, 125932, 149910, 75932, 23210, 233932, 193210, 35932, 163210, 249320],
  ['Sep.', 159980, 193320, 150087, 93320, 125932, 213320, 169980, 39320, 179980, 233320],
  ['Oct.', 150680, 218320, 129680, 88320, 25680, 258320, 179680, 38320, 159680, 268320],
  ['Nov.', 150080, 203340, 120980, 103340, 24980, 272340, 140980, 33340, 160980, 293340],
  ['Dec.', 159580, 213320, 139580, 113320, 22580, 303320, 129580, 34320, 149580, 323320]
]);

var scatter_data_set = anychart.data.set([
  ['Anne Watson', 28, 68, 68 * 2.2, 135, 70],
  ['Laura White', 21, 55, 55 * 2.2, 145, 85],
  ['Carolyn Campbell', 46, 66, 66 * 2.2, 142, 90],
  ['Rebeca Lewis', 39, 69, 69 * 2.2, 150, 86],
  ['Douglas Butler', 36, 81, 81 * 2.2, 156, 87],
  ['Arthur Sullivan', 56, 71, 71 * 2.2, 145, 95],
  ['Dorothy Harris', 19, 57, 57 * 2.2, 130, 84],
  ['Lori Hughes', 21, 67, 67 * 2.2, 155, 87],
  ['Sandra Hicks', 43, 72, 72 * 2.2, 143, 90],
  ['Phyllis Carter', 54, 84, 84 * 2.2, 147, 81],
  ['Billy Ferguson', 42, 90, 90 * 2.2, 135, 76],
  ['Daniel Cooper', 26, 92, 92 * 2.2, 160, 78],
  ['Roger Davis', 31, 83, 83 * 2.2, 167, 83],
  ['Dorothy Stone', 37, 70, 70 * 2.2, 134, 82],
  ['Catherine Miller', 26, 66, 66 * 2.2, 169, 81],
  ['Marilyn Montgomery', 24, 79, 79 * 2.2, 136, 89],
  ['Joshua Thomas', 25, 94, 94 * 2.2, 139, 76],
  ['Kelly Rivera', 42, 63, 63 * 2.2, 148, 78],
  ['Angela Morrison', 22, 64, 64 * 2.2, 156, 79],
  ['Lawrence West', 44, 72, 72 * 2.2, 151, 92],
  ['Kelly Perez', 39, 72, 72 * 2.2, 154, 94],
  ['Andrew Harvey', 51, 91, 91 * 2.2, 158, 98],
  ['Sharon Hall', 25, 93, 93 * 2.2, 152, 103],
  ['Paul Boyd', 30, 87, 87 * 2.2, 146, 112],
  ['Alice Ford', 31, 73, 73 * 2.2, 152, 114],
  ['Emily Evans', 26, 63, 63 * 2.2, 160, 99],
  ['Phillip Davis', 23, 89, 89 * 2.2, 169, 91],
  ['Jason Fields', 43, 109, 109 * 2.2, 165, 94],
  ['Billy Thompson', 64, 88, 88 * 2.2, 167, 93],
  ['Bobby Kelley', 32, 93, 93 * 2.2, 172, 70],
  ['Julie Stevens', 26, 61, 61 * 2.2, 163, 121],
  ['Mildred Knight', 56, 69, 69 * 2.2, 155, 86],
  ['Kathy Lewis', 38, 65, 65 * 2.2, 157, 88],
  ['Judith Wallace', 24, 67, 67 * 2.2, 149, 89],
  ['Gloria Cooper', 34, 71, 71 * 2.2, 162, 93],
  ['Christine Payne', 21, 68, 68 * 2.2, 163, 91],
  ['Howard Banks', 17, 76, 76 * 2.2, 164, 92],
  ['Kevin Wallace', 19, 59, 59 * 2.2, 160, 83],
  ['Jennifer Clark', 42, 74, 74 * 2.2, 156, 93],
  ['Kathryn Martin', 21, 64, 64 * 2.2, 159, 104]
]);

var scatter_male_set = anychart.data.set([
  ['Douglas Butler', 36, 81, 81 * 2.2, 156, 87],
  ['Arthur Sullivan', 56, 71, 71 * 2.2, 145, 95],
  ['Lori Hughes', 21, 67, 67 * 2.2, 155, 87],
  ['Phyllis Carter', 54, 84, 84 * 2.2, 147, 81],
  ['Billy Ferguson', 42, 90, 90 * 2.2, 135, 76],
  ['Daniel Cooper', 26, 92, 92 * 2.2, 160, 78],
  ['Roger Davis', 31, 83, 83 * 2.2, 167, 83],
  ['Joshua Thomas', 25, 94, 94 * 2.2, 139, 76],
  ['Lawrence West', 44, 72, 72 * 2.2, 151, 92],
  ['Andrew Harvey', 51, 91, 91 * 2.2, 158, 98],
  ['Paul Boyd', 30, 87, 87 * 2.2, 146, 112],
  ['Phillip Davis', 23, 89, 89 * 2.2, 169, 91],
  ['Jason Fields', 43, 109, 109 * 2.2, 165, 94],
  ['Billy Thompson', 64, 88, 88 * 2.2, 167, 93],
  ['Bobby Kelley', 32, 93, 93 * 2.2, 172, 70],
  ['Mildred Knight', 56, 69, 69 * 2.2, 155, 86],
  ['Howard Banks', 17, 76, 76 * 2.2, 164, 92],
  ['Kevin Wallace', 19, 59, 59 * 2.2, 160, 83]
]);

var scatter_female_set = anychart.data.set([
  ['Anne Watson', 28, 68, 68 * 2.2, 135, 70],
  ['Laura White', 21, 55, 55 * 2.2, 145, 85],
  ['Carolyn Campbell', 46, 66, 66 * 2.2, 142, 90],
  ['Rebeca Lewis', 39, 69, 69 * 2.2, 150, 86],
  ['Dorothy Harris', 19, 57, 57 * 2.2, 130, 84],
  ['Sandra Hicks', 43, 72, 72 * 2.2, 143, 90],
  ['Dorothy Stone', 37, 70, 70 * 2.2, 134, 82],
  ['Catherine Miller', 26, 66, 66 * 2.2, 169, 81],
  ['Marilyn Montgomery', 24, 79, 79 * 2.2, 136, 89],
  ['Kelly Rivera', 42, 63, 63 * 2.2, 148, 78],
  ['Angela Morrison', 22, 64, 64 * 2.2, 156, 79],
  ['Kelly Perez', 39, 72, 72 * 2.2, 154, 94],
  ['Sharon Hall', 25, 93, 93 * 2.2, 152, 103],
  ['Alice Ford', 31, 73, 73 * 2.2, 152, 114],
  ['Emily Evans', 26, 63, 63 * 2.2, 160, 99],
  ['Julie Stevens', 26, 61, 61 * 2.2, 163, 121],
  ['Kathy Lewis', 38, 65, 65 * 2.2, 157, 88],
  ['Judith Wallace', 24, 67, 67 * 2.2, 149, 89],
  ['Gloria Cooper', 34, 71, 71 * 2.2, 162, 93],
  ['Christine Payne', 21, 68, 68 * 2.2, 163, 91],
  ['Jennifer Clark', 42, 74, 74 * 2.2, 156, 93],
  ['Kathryn Martin', 21, 64, 64 * 2.2, 159, 104]
]);

var best_sportsmens_training_data = anychart.data.set([
  [5, 162, 125, '12/18/2014', 34],
  [8, 178, 145, '06/21/2014', 43],
  [8, 184, 129, '03/03/2015', 52],
  [3, 145, 141, '09/15/2014', 25],
  [7, 175, 137, '06/29/2014', 65],
  [7, 178, 98, '04/05/2015', 98],
  [8, 142, 69, '11/20/2014', 45],
  [8, 153, 139, '05/19/2014', 46],
  [3, 174, 144, '10/28/2014', 50],
  [7, 162, 129, '10/27/2014', 50],
  [8, 175, 123, '04/24/2015', 51],
  [5, 157, 132, '01/12/2015', 53],
  [5, 151, 119, '06/13/2014', 25],
  [10, 182, 87, '01/11/2015', 90],
  [1, 184, 113, '10/13/2014', -120],
  [2, 165, 145, '10/22/2014', 95],
  [10, 168, 128, '11/08/2014', 93],
  [5, 169, 74, '11/13/2014', 70],
  [7, 180, 113, '11/13/2014', 65],
  [1, 180, 94, '03/25/2015', 45],
  [3, 180, 94, '03/03/2015', 50],
  [2, 147, 71, '07/25/2014', 53],
  [5, 175, 119, '09/13/2014', 46],
  [8, 136, 84, '09/18/2014', 54],
  [10, 190, 128, '11/15/2014', 121],
  [9, 160, 131, '12/14/2014', 111],
  [1, 145, 137, '11/23/2014', 123],
  [7, 185, 78, '10/30/2014', 125],
  [2, 157, 138, '08/18/2014', 115],
  [10, 156, 96, '12/20/2014', 116],
  [9, 136, 65, '12/22/2014', 103],
  [8, 164, 81, '01/05/2015', 105],
  [9, 136, 108, '02/24/2015', 98],
  [2, 179, 107, '07/05/2014', 91],
  [1, 136, 89, '02/02/2015', 89],
  [5, 177, 106, '09/04/2014', 45],
  [8, 180, 97, '12/03/2014', 50],
  [9, 189, 147, '06/15/2014', 45],
  [5, 183, 98, '02/01/2015', 34],
  [6, 157, 79, '05/14/2014', 96],
  [10, 172, 129, '07/05/2014', 65],
  [3, 170, 142, '10/29/2014', 63],
  [9, 149, 67, '11/23/2014', 62],
  [4, 169, 84, '05/16/2014', 46],
  [4, 176, 123, '01/10/2015', 43],
  [9, 187, 83, '05/25/2014', 90],
  [8, 170, 114, '02/24/2015', 92],
  [3, 146, 120, '02/28/2015', 98],
  [8, 180, 119, '03/04/2015', 115],
  [1, 180, 96, '12/24/2014', 118],
  [6, 157, 121, '11/30/2014', 111],
  [7, 169, 93, '06/29/2014', 112],
  [4, 163, 106, '08/06/2014', 105],
  [10, 179, 71, '09/29/2014', 110],
  [6, 183, 68, '06/29/2014', 102],
  [9, 164, 75, '09/17/2014', 100],
  [4, 167, 96, '09/01/2014', 90],
  [7, 135, 77, '12/16/2014', 92],
  [1, 149, 113, '11/20/2014', 60],
  [2, 183, 110, '08/13/2014', 65],
  [7, 170, 103, '10/07/2014', 45],
  [9, 153, 112, '09/07/2014', 68],
  [9, 166, 148, '09/11/2014', 68],
  [1, 161, 94, '04/10/2015', 87],
  [2, 187, 65, '06/21/2014', 90],
  [4, 162, 131, '05/24/2014', 91],
  [10, 190, 82, '04/04/2015', 93],
  [10, 186, 100, '05/28/2014', 93],
  [3, 164, 66, '06/24/2014', 67],
  [8, 166, 143, '10/24/2014', 65],
  [1, 168, 141, '02/03/2015', 45],
  [7, 144, 111, '11/04/2014', 67],
  [6, 156, 66, '08/06/2014', 63],
  [7, 187, 148, '06/17/2014', 64],
  [6, 149, 133, '10/23/2014', 65],
  [8, 152, 92, '11/07/2014', 91],
  [7, 163, 105, '10/21/2014', 92],
  [2, 142, 139, '11/05/2014', 94],
  [10, 155, 94, '07/28/2014', 114],
  [3, 166, 137, '03/24/2015', 120],
  [4, 142, 124, '12/24/2014', 112],
  [2, 136, 90, '06/22/2014', 90],
  [10, 182, 79, '01/01/2015', 130],
  [10, 135, 90, '04/03/2015', 135],
  [6, 174, 120, '11/01/2014', 104],
  [10, 163, 146, '04/05/2015', 95],
  [7, 147, 104, '04/16/2015', 45],
  [4, 142, 70, '01/16/2015', 56],
  [7, 158, 77, '04/18/2015', 55],
  [2, 166, 70, '09/18/2014', 54],
  [6, 154, 150, '04/30/2015', 50],
  [7, 176, 83, '06/03/2014', 45],
  [4, 174, 89, '02/09/2015', 90],
  [2, 161, 131, '01/07/2015', 121],
  [5, 148, 127, '10/20/2014', 112],
  [6, 151, 112, '06/06/2014', 100],
  [6, 154, 97, '11/23/2014', 93],
  [3, 181, 121, '06/02/2014', 96],
  [5, 167, 92, '10/18/2014', 56],
  [1, 173, 127, '01/14/2015', 89]
]);

var ranges_data = anychart.data.set([
  {low: 393, high: 522, month: 'January'},
  {low: 425, high: 622, month: 'February'},
  {low: 419, high: 612, month: 'March'},
  {low: 492, high: 752, month: 'April'},
  {low: 579, high: 839, month: 'May'},
  {low: 632, high: 842, month: 'June'},
  {low: 532, high: 812, month: 'July'},
  {low: 557, high: 922, month: 'August'},
  {low: 694, high: 1052, month: 'September'},
  {low: 868, high: 1317, month: 'October'},
  {low: 868, high: 1302, month: 'November'},
  {low: 772, high: 1245, month: 'December'}
]);

var ranges_data_last = anychart.data.set([
  {low: 143, high: 282, month: 'January'},
  {low: 225, high: 322, month: 'February'},
  {low: 219, high: 312, month: 'March'},
  {low: 292, high: 352, month: 'April'},
  {low: 379, high: 439, month: 'May'},
  {low: 432, high: 542, month: 'June'},
  {low: 332, high: 412, month: 'July'},
  {low: 357, high: 422, month: 'August'},
  {low: 494, high: 552, month: 'September'},
  {low: 668, high: 717, month: 'October'},
  {low: 668, high: 702, month: 'November'},
  {low: 572, high: 645, month: 'December'}
]);

var box_data = [
  {x: 'Registered Nurse', low: 20000, q1: 26000, median: 27000, q3: 32000, high: 38000, outliers: [50000, 57000]},
  {x: 'Dental Hygienist', low: 24000, q1: 28000, median: 32000, q3: 38000, high: 42000, outliers: [48000]},
  {
    x: 'Computer Systems Analyst',
    low: 40000,
    q1: 49000,
    median: 62000,
    q3: 73000,
    high: 88000,
    outliers: [32000, 29000, 106000]
  },
  {x: 'Physical Therapist', low: 52000, q1: 59000, median: 65000, q3: 74000, high: 83000, outliers: [91000]},
  {x: 'Software Developer', low: 45000, q1: 54000, median: 66000, q3: 81000, high: 97000, outliers: [120000]},
  {
    x: 'Information Security Analyst',
    low: 47000,
    q1: 56000,
    median: 69000,
    q3: 85000,
    high: 100000,
    outliers: [110000, 115000, 32000]
  },
  {x: 'Nurse Practitioner', low: 64000, q1: 74000, median: 83000, q3: 93000, high: 100000, outliers: [110000]},
  {x: 'Physician Assistant', low: 67000, q1: 72000, median: 84000, q3: 95000, high: 110000, outliers: [57000, 54000]},
  {x: 'Dentist', low: 75000, q1: 99000, median: 123000, q3: 160000, high: 210000, outliers: [220000, 70000]},
  {x: 'Physician', low: 58000, q1: 96000, median: 130000, q3: 170000, high: 200000, outliers: [42000, 210000, 215000]}
];

var average_client_age_data_by_regions = anychart.data.set([
  ['Florida', 31, 4, 3],
  ['NewYork', 39, 6, 6],
  ['France', 47, 8, 12],
  ['Spain', 60, 7, 8],
  ['China', 48, 5, 6],
  ['India', 23, 8.3, 6],
  ['Brazil', 50, 5.4, 11],
  ['Philippine', 43, 16, 15],
  ['Arizona', 31, 10, 4],
  ['California', 29, 3, 7]
]).mapAs({
  x: [0],
  value: [1],
  valueLowerError: [2],
  valueUpperError: [3]
});

var average_male_age_data_by_regions = anychart.data.set([
  ['Florida', 30, 4, 3],
  ['NewYork', 32, 6, 6],
  ['France', 43, 8, 12],
  ['Arizona', 30, 10, 4],
  ['California', 24, 3, 7]
]).mapAs({
  x: [0],
  value: [1],
  valueLowerError: [2],
  valueUpperError: [3]
});

var average_female_age_data_by_regions = anychart.data.set([
  ['Florida', 32, 4, 3],
  ['NewYork', 42, 6, 6],
  ['France', 48, 8, 12],
  ['Arizona', 35, 10, 4],
  ['California', 37, 3, 7]
]).mapAs({
  x: [0],
  value: [1],
  valueLowerError: [2],
  valueUpperError: [3]
});

var marker_error_data = anychart.data.set([
  [101.8871544450521, -80.75603982433677, 68, 47, 110, 48],
  [155.810951165855, 214.2723776474595, 81, 52, 56, 101],
  [203.250035367906, 3.05145130679011, 72, 34, 90, 96],
  [256.0341778919101, -120.86547581106424, 32, 36, 120, 103],
  [408.9005448967218, 94.85958395153284, 68, 52, 123, 99],
  [427.1872748956084, -203.48837719112635, 48, 102, 118, 94],

  [790.1034905686975, 578.32297029346228, 38, 42, 48, 74],
  [751.2865408137441, 489.1917199790478, 37, 29, 61, 58],
  [846.9176428839564, 423.6071574948728, 54, 32, 61, 93],
  [902.3598393574357, 560.46232794225216, 48.034, 52, 72, 98],
  [901.4813169538975, 321.57294746488333, 28, 29, 130, 42],
  [1023.732014581561, 224.7758020609617, 54, 23, 148, 94.6],
  [1124.1393811926246, 508.05048871412873, 63, 42, 132, 108],

  [1234.460888326168, -476.815727699548, 59, 71, 100.04, 18],
  [1236.66775120794773, -235.65700424462557, 37, 26, 59.7, 58],
  [1401.5943283513188, -123.7888190932572, 68, 29, 35, 28],
  [1441.3984118625522, -223.1356431134045, 38, 29, 118, 44],
  [1352.1733933240175, -497.88095516338944, 29.09, 27, 117, 91],
  [1474.0087166205049, -475.06017890200019, 34, 39, 103, 34],
  [1492.8169632852077, -268.41374530270696, 31, 49, 108.06, 52],
  [1592.577681608498, -267.3424177132547, 28, 26, 122, 38],
  [1590.6276988238096, -69.55818405747414, 61, 28, 121, 59],
  [1620.9351842403412, -469.9934994727373, 63, 29.09, 111, 61.09],
  [1810.7067560553551, -296.1982044093311, 59.08, 27.89, 119.76, 91]
]).mapAs({
  x: [0],
  value: [1],
  xLowerError: [2],
  xUpperError: [3],
  valueLowerError: [4],
  valueUpperError: [5]
});

var marker_error_male_data = anychart.data.set([
  [101.8871544450521, -80.75603982433677, 68, 47, 110, 48],
  [155.810951165855, 214.2723776474595, 81, 52, 56, 101],

  [427.1872748956084, -203.48837719112635, 48, 102, 118, 94],

  [790.1034905686975, 578.32297029346228, 38, 42, 48, 74],
  [751.2865408137441, 489.1917199790478, 37, 29, 61, 58],

  [1124.1393811926246, 508.05048871412873, 63, 42, 132, 108],

  [1234.460888326168, -476.815727699548, 59, 71, 100.04, 18],
  [1236.66775120794773, -235.65700424462557, 37, 26, 59.7, 58],
  [1401.5943283513188, -123.7888190932572, 68, 29, 35, 28],
  [1441.3984118625522, -223.1356431134045, 38, 29, 118, 44],
  [1352.1733933240175, -497.88095516338944, 29.09, 27, 117, 91]
]).mapAs({
  x: [0],
  value: [1],
  xLowerError: [2],
  xUpperError: [3],
  valueLowerError: [4],
  valueUpperError: [5]
});

var marker_error_female_data = anychart.data.set([
  [203.250035367906, 3.05145130679011, 72, 34, 90, 96],
  [256.0341778919101, -120.86547581106424, 32, 36, 120, 103],
  [408.9005448967218, 94.85958395153284, 68, 52, 123, 99],

  [846.9176428839564, 423.6071574948728, 54, 32, 61, 93],
  [902.3598393574357, 560.46232794225216, 48.034, 52, 72, 98],
  [901.4813169538975, 321.57294746488333, 28, 29, 130, 42],
  [1023.732014581561, 224.7758020609617, 54, 23, 148, 94.6],

  [1474.0087166205049, -475.06017890200019, 34, 39, 103, 34],
  [1492.8169632852077, -268.41374530270696, 31, 49, 108.06, 52],
  [1592.577681608498, -267.3424177132547, 28, 26, 122, 38],
  [1590.6276988238096, -69.55818405747414, 61, 28, 121, 59],
  [1620.9351842403412, -469.9934994727373, 63, 29.09, 111, 61.09],
  [1810.7067560553551, -296.1982044093311, 59.08, 27.89, 119.76, 91]
]).mapAs({
  x: [0],
  value: [1],
  xLowerError: [2],
  xUpperError: [3],
  valueLowerError: [4],
  valueUpperError: [5]
});

var table_data = {
  'Alabama': {
    actualSales: [2.173, 2.313, 2.233, 2.303, 3.743, 1.265, 1.881, 2.854, 1.009, 1.022, 3.165, 2.232],
    toGoal: [1.508, 3.252, 1.795, 1.329, 2.289, 3.464, 1.98, 3.301, 2.643, 2.254, 1.82, 3.868],
    profitTrend: [2.434, -1.593, 1.094, 3.264, 2.102, -2.003, 3.814, 2.564, 2.553, -1.903, 2.61, -2.123]
  },
  'Alaska': {
    actualSales: [3.92, 1.433, 2.181, 2.042, 3.357, 2.786, 2.441, 3.205, 1.342, 2.619, 1.811, 3.738],
    toGoal: [1.329, 1.226, 1.303, 2.848, 1.078, 1.32, 3.081, 1.153, 2.89, 1.911, 2.698, 3.406],
    profitTrend: [3.166, -3.161, 3.746, -1.057, -2.122, 3.207, 3.124, 2.358, 1.041, 3.781, 1.576, 3.51]
  },
  'Arizona': {
    actualSales: [2.171, 1.522, 3.418, 2.124, 3.741, 1.93, 2.019, 2.317, 1.038, 3.585, 2.048, 3.715],
    toGoal: [2.033, 1.141, 2.754, 1.386, 1.808, 1.671, 2.332, 3.274, 1.628, 1.588, 2.244, 1.872],
    profitTrend: [3.234, -1.492, 2.295, -2.02, 3.194, 2.546, 3.08, -2.702, 1.505, -1.074, 2.223, 1.723]
  },
  'Idaho': {
    actualSales: [1.831, 2.913, 2.781, 1.046, 2.032, 3.538, 3.746, 2.654, 1.32, 3.416, 3.86, 3.072],
    toGoal: [3.438, 3.772, 2.881, 1.971, 3.214, 1.403, 3.151, 2.31, 1.42, 1.117, 2.638, 3.578],
    profitTrend: [-1.783, 1.956, 2.133, 3.224, -1.346, -1.13, 3.561, 2.867, 1.769, -1.738, 3.901, 3.542]
  },
  'Illinois': {
    actualSales: [1.396, 2.276, 3.223, 1.376, 3.324, 3.671, 3.946, 3.148, 2.799, 3.537, 2.937, 2.203],
    toGoal: [3.539, 3.474, 3.363, 3.834, 2.237, 2.239, 3.833, 2.913, 1.29, 1.051, 1.098, 1.332],
    profitTrend: [2.29, 1.201, 2.566, -1.567, 3.748, 3.483, 2.01, 2.138, 1.316, -1.43, 1.1, 2.932]
  },
  'Indiana': {
    actualSales: [2.223, 2.979, 2.902, 1.321, 2.709, 3.249, 1.544, 1.863, 2.751, 3.566, 1.635, 1.772],
    toGoal: [2.005, 1.513, 1.835, 3.688, 1.776, 2.363, 3.928, 1.604, 1.12, 1.558, 3.978, 1.363],
    profitTrend: [3.262, -1.396, 2.679, 3.553, 2.489, 2.404, -1.774, 2.549, -1.201, 3.037, 1.38, 1.333]
  },
  'Ohio': {
    actualSales: [3.797, 2.34, 2.955, 1.645, 2.268, 2.507, 2.808, 1.762, 1.433, 3.76, 1.259, 2.017],
    toGoal: [1.21, 2.74, 3.919, 2.706, 1.44, 3.698, 2.558, 2.386, 1.764, 2.953, 2.166, 1.511],
    profitTrend: [3.042, -1.914, 2.443, 2.646, 3.761, 1.181, -1.746, 3.889, -1.73, 1.974, 2.831, 2.307]
  },
  'Oklahoma': {
    actualSales: [2.223, 3.569, 2.527, 3.449, 1.407, 2.24, 3.21, 3.104, 3.673, 3.365, 1.879, 2.703],
    toGoal: [2.441, 3.925, 1.915, 2.419, 2.447, 1.69, 3.138, 1.859, 3.886, 2.072, 3.131, 2.407],
    profitTrend: [2.061, 3.792, 3.711, -1.753, 1.947, 2.674, -1.873, 3.141, -2.636, 3.394, 1.074, 3.516]
  },
  'Oregon': {
    actualSales: [3.405, 1.784, 3.735, 1.768, 3.243, 2.868, 1.546, 3.761, 2.988, 2.579, 1.353, 2.119],
    toGoal: [2.516, 1.287, 3.444, 2.822, 3.376, 1.521, 2.289, 2.407, 2.821, 3.82, 3.931, 2.079],
    profitTrend: [2.327, 3.3, -1.302, 1.812, 1.906, 3.645, 1.727, -1.204, 3.882, -1.282, 1.541, 2.147]
  },
  'Vermont': {
    actualSales: [1.604, 2.514, 3.3, 1.54, 3.477, 1.834, 3.031, 2.749, 2.134, 2.722, 2.839, 1.228],
    toGoal: [3.024, 1.535, 1.81, 2.234, 3.456, 1.436, 3.891, 3.016, 3.785, 2.826, 1.324, 3.139],
    profitTrend: [-1.746, 2.522, 1.502, 2.094, 2.911, 2.024, 2.509, -1.758, 3.12, 2.521, 2.019, 1.093]
  },
  'Virginia': {
    actualSales: [2.316, 2.339, 1.547, 1.914, 2.731, 3.561, 1.349, 1.247, 2.634, 2.393, 2.264, 2.551],
    toGoal: [2.724, 3.603, 1.065, 3.948, 2.025, 3.046, 2.524, 3.118, 2.802, 1.878, 1.335, 2.197],
    profitTrend: [-1.334, 3.606, 3.518, 1.774, 2.552, 3.541, 2.385, 3.343, -1.871, 2.723, 3.023, 3.417]
  },
  'Washington': {
    actualSales: [3.718, 2.24, 1.779, 1.698, 1.612, 3.81, 1.548, 3.754, 1.655, 1.505, 3.567, 2.601],
    toGoal: [2.168, 1.641, 2.654, 3.205, 2.397, 1.37, 3.301, 2.553, 3.433, 3.084, 1.0, 1.49],
    profitTrend: [3.92, 3.257, 2.299, -1.358, -1.936, 2.097, 1.282, 1.642, 3.573, -2.761, 3.084, 1.319]
  }
};

var t1 = [1, -1, 1, 1, -1, 1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, 1, -1, 1, -1, 1];
var t2 = [-1, 1, 1, -1, -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1, 1, -1, -1, 1, -1];
var t3 = [1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1, 1, -1, -1, -1, 1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1];
var t4 = [1, -1, 1, 1, 1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, -1, 1, -1, 1, -1, -1, -1, 1, -1, -1, 1, 1, 1, -1, -1, -1, -1, -1, -1];
var t5 = [-1, 1, -1, 1, 1, -1, 1, -1, -1, 1, -1, -1, -1, -1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1, 1, 1, 1, -1, 1, 1, 1, 1, -1, -1, -1, -1, -1, 1];
var t6 = [-1, -1, -1, -1, -1, -1, -1, 1, 1, -1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, -1, 1, 1];
var t7 = [-1, 1, -1, 1, 1, -1, -1, -1, -1, -1, 1, 1, 1, -1, 1, -1, 1, -1, 1, 1, 1, -1, -1, -1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1, 1, -1, -1, 1];
var t8 = [-1, 1, 1, -1, 1, 1, 1, -1, 1, 1, -1, 1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, 1, -1];
var t9 = [1, -1, 1, 1, -1, 1, -1, -1, -1, -1, 1, 1, -1, -1, -1, -1, -1, 1, 1, -1, -1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, -1, 1, -1, -1, -1];
var t10 = [1, -1, 1, -1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, -1, -1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1];
var t11 = [1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, -1, -1, 1, -1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1, -1, -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, -1, -1];
var t12 = [-1, 1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 1];
var t13 = [1, -1, -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, -1, -1, 1, -1, -1, -1, 1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1, 1, -1];
var t14 = [-1, -1, -1, 1, 1, -1, 1, 1, 1, -1, -1, -1, -1, 1, -1, -1, -1, 1, -1, -1, -1, 1, 1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, -1, -1, -1];
var t15 = [-1, 1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, -1, -1, -1, 1, -1, 1];
var t16 = [-1, -1, -1, -1, -1, -1, -1, 1, -1, -1, 1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, -1, 1, -1, 1, -1, 1, -1, -1, -1, 1, -1, -1, -1, 1, 1, -1, -1];
var t17 = [-1, -1, -1, -1, -1, -1, 1, -1, 1, 1, 1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, 1, -1, -1, -1, -1, -1, 1, -1, -1, 1, -1, 1, 1, -1];
var t18 = [-1, -1, -1, 1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, -1, 1, -1, -1, -1, 1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1];
var t19 = [1, -1, -1, -1, 1, 1, -1, 1, -1, 1, -1, -1, 1, -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, 1, -1, -1, -1, -1];
var t20 = [-1, -1, -1, -1, -1, -1, -1, 1, -1, -1, 1, -1, -1, -1, 1, -1, -1, 1, -1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1];

var radarDataSet = anychart.data.set([
  ['Strength', 136, 199, 43],
  ['Agility', 79, 125, 56],
  ['Stamina', 149, 173, 101],
  ['Intellect', 135, 33, 202],
  ['Spirit', 158, 64, 196]
]);

var polar_data = anychart.data.set([
  [30, 0],
  [30, 85],
  [5, 80],
  [10, 75],
  [15, 70],
  [20, 65],
  [25, 60],
  [30, 55],
  [5, 50],
  [10, 45],
  [15, 40],
  [20, 35],
  [25, 30],
  [30, 25],
  [5, 20],
  [10, 15],
  [15, 10],
  [20, 5],
  [25, 0]
]);
