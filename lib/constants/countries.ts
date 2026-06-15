export const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
    'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
    'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
    'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
    'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark',
    'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji',
    'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece',
    'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
    'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
    'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait',
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya',
    'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia',
    'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius',
    'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco',
    'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
    'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay',
    'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
    'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands',
    'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
    'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
    'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago',
    'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates',
    'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
    'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
] as const;

export type Country = (typeof COUNTRIES)[number];

export const DIVISIONS_BY_COUNTRY: Record<string, string[]> = {
    Bangladesh: [
        'Dhaka Division', 'Chittagong Division', 'Khulna Division', 'Rajshahi Division',
        'Sylhet Division', 'Barisal Division', 'Rangpur Division', 'Mymensingh Division',
    ],
    India: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
        'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
        'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
        'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh',
    ],
    Pakistan: [
        'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
        'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Jammu and Kashmir',
    ],
    'United States': [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
        'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
        'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
        'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
        'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
        'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
        'West Virginia', 'Wisconsin', 'Wyoming',
    ],
    'United Kingdom': [
        'England', 'Scotland', 'Wales', 'Northern Ireland',
    ],
    Australia: [
        'New South Wales', 'Victoria', 'Queensland', 'Western Australia',
        'South Australia', 'Tasmania', 'Australian Capital Territory', 'Northern Territory',
    ],
    Canada: [
        'Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan',
        'Nova Scotia', 'New Brunswick', 'Newfoundland and Labrador',
        'Prince Edward Island', 'Northwest Territories', 'Yukon', 'Nunavut',
    ],
    Germany: [
        'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
        'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia',
        'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt',
        'Schleswig-Holstein', 'Thuringia',
    ],
    France: [
        'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire',
        'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy',
        'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire',
        'Provence-Alpes-Côte d\'Azur', 'Guadeloupe', 'Martinique', 'French Guiana',
    ],
    Japan: [
        'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
        'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
        'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano',
    ],
    'Saudi Arabia': [
        'Riyadh Province', 'Mecca Province', 'Medina Province', 'Eastern Province',
        'Asir Province', 'Tabuk Province', 'Hail Province', 'Northern Borders Province',
        'Jazan Province', 'Najran Province', 'Al Bahah Province', 'Al Jawf Province',
        'Al Qassim Province',
    ],
    'United Arab Emirates': [
        'Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain',
        'Ras Al Khaimah', 'Fujairah',
    ],
    Turkey: [
        'Marmara Region', 'Aegean Region', 'Mediterranean Region', 'Black Sea Region',
        'Central Anatolia Region', 'Eastern Anatolia Region', 'Southeastern Anatolia Region',
    ],
    Indonesia: [
        'Aceh', 'Bali', 'Banten', 'Bengkulu', 'Gorontalo', 'Jakarta', 'Jambi',
        'West Java', 'Central Java', 'East Java', 'West Kalimantan', 'South Kalimantan',
        'Central Kalimantan', 'East Kalimantan', 'North Kalimantan', 'Riau Islands',
        'Lampung', 'Maluku', 'North Maluku', 'West Nusa Tenggara',
    ],
    Malaysia: [
        'Johor', 'Kedah', 'Kelantan', 'Malacca', 'Negeri Sembilan', 'Pahang', 'Penang',
        'Perak', 'Perlis', 'Sabah', 'Sarawak', 'Selangor', 'Terengganu',
        'Kuala Lumpur', 'Labuan', 'Putrajaya',
    ],
    'Sri Lanka': [
        'Central Province', 'Eastern Province', 'North Central Province',
        'Northern Province', 'North Western Province', 'Sabaragamuwa Province',
        'Southern Province', 'Uva Province', 'Western Province',
    ],
    Nepal: [
        'Koshi Province', 'Madhesh Province', 'Bagmati Province', 'Gandaki Province',
        'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province',
    ],
    'South Africa': [
        'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
        'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape',
    ],
    Nigeria: [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
        'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
        'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
    ],
    Egypt: [
        'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo',
        'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia',
        'Kafr El Sheikh', 'Luxor', 'Matrouh', 'Minya', 'Monufia', 'New Valley',
        'North Sinai', 'Port Said',
    ],
    'South Korea': [
        'Seoul', 'Busan', 'Daegu', 'Incheon', 'Gwangju', 'Daejeon', 'Ulsan',
        'Sejong', 'Gyeonggi Province', 'Gangwon Province', 'North Chungcheong Province',
        'South Chungcheong Province', 'North Jeolla Province', 'South Jeolla Province',
        'North Gyeongsang Province', 'South Gyeongsang Province', 'Jeju Province',
    ],
    Thailand: [
        'Bangkok', 'Central Region', 'Eastern Region', 'Northern Region',
        'Northeastern Region', 'Southern Region', 'Western Region',
    ],
    Brazil: [
        'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Espírito Santo',
        'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais',
        'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro',
        'Rio Grande do Norte', 'Rio Grande do Sul',
    ],
    Russia: [
        'Moscow', 'Moscow Oblast', 'Saint Petersburg', 'Leningrad Oblast',
        'Novosibirsk Oblast', 'Sverdlovsk Oblast', 'Nizhny Novgorod Oblast',
        'Republic of Tatarstan', 'Chelyabinsk Oblast', 'Samara Oblast',
        'Rostov Oblast', 'Republic of Bashkortostan', 'Krasnoyarsk Krai',
        'Krasnodar Krai', 'Volgograd Oblast', 'Perm Krai', 'Voronezh Oblast',
        'Saratov Oblast', 'Kaliningrad Oblast', 'Primorsky Krai',
    ],
    China: [
        'Anhui', 'Fujian', 'Gansu', 'Guangdong', 'Guizhou', 'Hainan', 'Hebei',
        'Heilongjiang', 'Henan', 'Hubei', 'Hunan', 'Jiangsu', 'Jiangxi', 'Jilin',
        'Liaoning', 'Qinghai', 'Shaanxi', 'Shandong', 'Shanxi', 'Sichuan',
    ],
    Italy: [
        'Abruzzo', 'Aosta Valley', 'Apulia', 'Basilicata', 'Calabria', 'Campania',
        'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy',
        'Marche', 'Molise', 'Piedmont', 'Sardinia', 'Sicily', 'Trentino-Alto Adige',
        'Tuscany', 'Umbria', 'Veneto',
    ],
    Spain: [
        'Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country',
        'Canary Islands', 'Cantabria', 'Castile and León', 'Castilla-La Mancha',
        'Catalonia', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Murcia',
        'Navarre', 'Valencian Community',
    ],
    Netherlands: [
        'Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg',
        'North Brabant', 'North Holland', 'Overijssel', 'South Holland', 'Utrecht',
        'Zeeland',
    ],
    Switzerland: [
        'Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft',
        'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Grisons', 'Jura',
        'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz',
        'Solothurn', 'St. Gallen', 'Thurgau',
    ],
    Sweden: [
        'Blekinge', 'Dalarna', 'Gotland', 'Gävleborg', 'Halland', 'Jämtland',
        'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten', 'Örebro', 'Östergötland',
        'Skåne', 'Södermanland', 'Stockholm', 'Uppsala', 'Värmland', 'Västerbotten',
        'Västernorrland', 'Västmanland',
    ],
    'New Zealand': [
        'Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', 'Hawke\'s Bay',
        'Manawatu-Whanganui', 'Marlborough', 'Nelson', 'Northland', 'Otago',
        'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast',
    ],
    Singapore: [
        'Singapore',
    ],
    Philippines: [
        'National Capital Region', 'Cordillera Administrative Region', 'Ilocos Region',
        'Cagayan Valley', 'Central Luzon', 'Calabarzon', 'Mimaropa', 'Bicol Region',
        'Western Visayas', 'Central Visayas', 'Eastern Visayas', 'Zamboanga Peninsula',
        'Northern Mindanao', 'Davao Region', 'Soccsksargen', 'Caraga', 'Bangsamoro',
    ],
    Vietnam: [
        'Hanoi', 'Ho Chi Minh City', 'Haiphong', 'Da Nang', 'Can Tho',
        'An Giang', 'Ba Ria-Vung Tau', 'Bac Giang', 'Bac Ninh', 'Ben Tre',
        'Binh Dinh', 'Binh Duong', 'Binh Phuoc', 'Binh Thuan', 'Ca Mau',
        'Dak Lak', 'Dak Nong', 'Dien Bien', 'Dong Nai', 'Dong Thap',
    ],
    Mexico: [
        'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
        'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
        'Guerrero', 'Hidalgo', 'Jalisco', 'Mexico State', 'Michoacán', 'Morelos',
        'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla',
    ],
    Argentina: [
        'Buenos Aires', 'Buenos Aires Province', 'Catamarca', 'Chaco', 'Chubut',
        'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa',
        'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta',
        'San Juan', 'San Luis', 'Santa Cruz',
    ],
    Chile: [
        'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
        'Valparaíso', 'Santiago Metropolitan', 'O\'Higgins', 'Maule', 'Ñuble',
        'Biobío', 'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes',
    ],
    Colombia: [
        'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
        'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
        'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena',
        'Meta',
    ],
    Peru: [
        'Amazonas', 'Ancash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
        'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
        'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura',
    ],
    Kenya: [
        'Central', 'Coast', 'Eastern', 'Nairobi', 'North Eastern', 'Nyanza',
        'Rift Valley', 'Western',
    ],
    Ghana: [
        'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern',
        'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah',
        'Upper East', 'Upper West', 'Volta', 'Western', 'Western North',
    ],
    Ethiopia: [
        'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Central Ethiopia',
        'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali',
        'South Ethiopia', 'South West Ethiopia', 'Tigray',
    ],
    Morocco: [
        'Tanger-Tetouan-Al Hoceima', 'Oriental', 'Fès-Meknès', 'Rabat-Salé-Kénitra',
        'Béni Mellal-Khénifra', 'Casablanca-Settat', 'Marrakech-Safi',
        'Drâa-Tafilalet', 'Souss-Massa', 'Guelmim-Oued Noun',
        'Laâyoune-Sakia El Hamra', 'Dakhla-Oued Ed-Dahab',
    ],
    Iran: [
        'Tehran', 'Isfahan', 'Fars', 'Razavi Khorasan', 'East Azerbaijan',
        'Khuzestan', 'Mazandaran', 'West Azerbaijan', 'Kerman', 'Gilan',
        'Sistan and Baluchestan', 'Kermanshah', 'Hormozgan', 'Yazd', 'Ardabil',
        'Qom', 'Qazvin', 'Zanjan', 'Hamedan', 'Markazi',
    ],
    Iraq: [
        'Baghdad', 'Basra', 'Nineveh', 'Erbil', 'Sulaymaniyah', 'Duhok',
        'Kirkuk', 'Anbar', 'Babil', 'Karbala', 'Najaf', 'Wasit', 'Dhi Qar',
        'Maysan', 'Muthanna', 'Qadisiyah', 'Salah ad Din', 'Diyala',
    ],
    Afghanistan: [
        'Badakhshan', 'Badghis', 'Baghlan', 'Balkh', 'Bamyan', 'Daykundi',
        'Farah', 'Faryab', 'Ghazni', 'Ghor', 'Helmand', 'Herat', 'Jowzjan',
        'Kabul', 'Kandahar', 'Kapisa', 'Khost', 'Kunar', 'Kunduz', 'Laghman',
    ],
    Myanmar: [
        'Ayeyarwady Region', 'Bago Region', 'Chin State', 'Kachin State',
        'Kayah State', 'Kayin State', 'Magway Region', 'Mandalay Region',
        'Mon State', 'Naypyidaw Union Territory', 'Rakhine State',
        'Sagaing Region', 'Shan State', 'Tanintharyi Region', 'Yangon Region',
    ],
    Cambodia: [
        'Phnom Penh', 'Banteay Meanchey', 'Battambang', 'Kampong Cham', 'Kampong Chhnang',
        'Kampong Speu', 'Kampong Thom', 'Kampot', 'Kandal', 'Kep', 'Koh Kong',
        'Kratié', 'Mondulkiri', 'Oddar Meanchey', 'Pailin', 'Preah Sihanouk',
        'Preah Vihear', 'Prey Veng', 'Pursat', 'Ratanakiri',
    ],
    Laos: [
        'Vientiane Capital', 'Attapeu', 'Bokeo', 'Bolikhamsai', 'Champasak',
        'Houaphanh', 'Khammouane', 'Luang Namtha', 'Luang Prabang', 'Oudomxay',
        'Phongsaly', 'Sainyabuli', 'Salavan', 'Savannakhet', 'Sekong',
        'Vientiane Province', 'Xiangkhouang', 'Xaisomboun',
    ],
    Qatar: [
        'Al Shamal', 'Al Khor', 'Al-Shahaniya', 'Umm Salal', 'Al Daayen',
        'Doha', 'Al Rayyan', 'Al Wakrah',
    ],
    Oman: [
        'Muscat', 'Dhofar', 'Musandam', 'Al Buraimi', 'Al Dakhiliyah',
        'Al Batinah North', 'Al Batinah South', 'Al Sharqiyah North',
        'Al Sharqiyah South', 'Al Dhahirah', 'Al Wusta',
    ],
    Kuwait: [
        'Al Asimah', 'Hawalli', 'Farwaniya', 'Mubarak Al-Kabeer', 'Ahmadi', 'Jahra',
    ],
    Bahrain: [
        'Capital Governorate', 'Muharraq Governorate', 'Northern Governorate',
        'Southern Governorate',
    ],
    Jordan: [
        'Amman', 'Irbid', 'Zarqa', 'Balqa', 'Madaba', 'Jerash', 'Ajloun',
        'Mafraq', 'Karak', 'Tafilah', 'Ma\'an', 'Aqaba',
    ],
    Lebanon: [
        'Beirut', 'Akkar', 'Baalbek-Hermel', 'Beqaa', 'Mount Lebanon',
        'Nabatieh', 'North Lebanon', 'South Lebanon',
    ],
    Syria: [
        'Damascus', 'Aleppo', 'Homs', 'Hama', 'Latakia', 'Deir ez-Zor',
        'Raqqa', 'Al-Hasakah', 'Tartus', 'Idlib', 'Daraa', 'As-Suwayda',
        'Quneitra', 'Rif Dimashq',
    ],
    Yemen: [
        'Aden', 'Amran', 'Abyan', 'Al Bayda', 'Al Hudaydah', 'Al Mahrah',
        'Al Mahwit', 'Dhamar', 'Hadhramaut', 'Hajjah', 'Ibb', 'Lahij',
        'Marib', 'Raymah', 'Saada', 'Sana\'a', 'Shabwah', 'Socotra', 'Taiz',
    ],
    Mongolia: [
        'Arkhangai', 'Bayan-Ölgii', 'Bayankhongor', 'Bulgan', 'Darkhan-Uul',
        'Dornod', 'Dornogovi', 'Dundgovi', 'Govi-Altai', 'Govisümber',
        'Khentii', 'Khovd', 'Khövsgöl', 'Ömnögovi', 'Orkhon', 'Övörkhangai',
        'Selenge', 'Sükhbaatar', 'Töv', 'Uvs',
    ],
    Kazakhstan: [
        'Abai Region', 'Akmola Region', 'Aktobe Region', 'Almaty', 'Almaty Region',
        'Astana', 'Atyrau Region', 'East Kazakhstan Region', 'Jambyl Region',
        'Jetisu Region', 'Karaganda Region', 'Kostanay Region', 'Kyzylorda Region',
        'Mangystau Region', 'North Kazakhstan Region', 'Pavlodar Region',
        'Shymkent', 'Turkistan Region', 'Ulytau Region', 'West Kazakhstan Region',
    ],
    Uzbekistan: [
        'Andijan Region', 'Bukhara Region', 'Fergana Region', 'Jizzakh Region',
        'Karakalpakstan', 'Namangan Region', 'Navoiy Region', 'Qashqadaryo Region',
        'Samarkand Region', 'Sirdaryo Region', 'Surxondaryo Region',
        'Tashkent City', 'Tashkent Region', 'Xorazm Region',
    ],
    Azerbaijan: [
        'Baku', 'Absheron-Khizi', 'Central Aran', 'Daglig-Shirvan', 'Ganja-Dashkasan',
        'Gazakh-Tovuz', 'Guba-Khachmaz', 'Lankaran-Astara', 'Mil-Mughan',
        'Nakhchivan', 'Shaki-Zagatala', 'Shirvan-Salyan', 'Zangezur', 'Karabakh',
    ],
    Georgia: [
        'Tbilisi', 'Adjara', 'Guria', 'Imereti', 'Kakheti', 'Kvemo Kartli',
        'Mtskheta-Mtianeti', 'Racha-Lechkhumi and Kvemo Svaneti', 'Samegrelo-Zemo Svaneti',
        'Samtskhe-Javakheti', 'Shida Kartli',
    ],
    Armenia: [
        'Aragatsotn', 'Ararat', 'Armavir', 'Gegharkunik', 'Kotayk', 'Lori',
        'Shirak', 'Syunik', 'Tavush', 'Vayots Dzor', 'Yerevan',
    ],
    Poland: [
        'Greater Poland', 'Kuyavian-Pomeranian', 'Lesser Poland', 'Łódź',
        'Lower Silesian', 'Lublin', 'Lubusz', 'Masovian', 'Opole',
        'Podlaskie', 'Pomeranian', 'Silesian', 'Subcarpathian',
        'Świętokrzyskie', 'Warmian-Masurian', 'West Pomeranian',
    ],
    'Czech Republic': [
        'Prague', 'Central Bohemia', 'South Bohemia', 'Plzeň', 'Karlovy Vary',
        'Ústí nad Labem', 'Liberec', 'Hradec Králové', 'Pardubice', 'Olomouc',
        'Moravian-Silesian', 'South Moravia', 'Zlín', 'Vysočina',
    ],
    Austria: [
        'Burgenland', 'Carinthia', 'Lower Austria', 'Upper Austria', 'Salzburg',
        'Styria', 'Tyrol', 'Vorarlberg', 'Vienna',
    ],
    Hungary: [
        'Bács-Kiskun', 'Baranya', 'Békés', 'Borsod-Abaúj-Zemplén', 'Budapest',
        'Csongrád-Csanád', 'Fejér', 'Győr-Moson-Sopron', 'Hajdú-Bihar',
        'Heves', 'Jász-Nagykun-Szolnok', 'Komárom-Esztergom', 'Nógrád',
        'Pest', 'Somogy', 'Szabolcs-Szatmár-Bereg', 'Tolna', 'Vas',
        'Veszprém', 'Zala',
    ],
    Portugal: [
        'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra',
        'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisbon', 'Portalegre',
        'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real',
        'Viseu', 'Azores', 'Madeira',
    ],
    Belgium: [
        'Flemish Region', 'Walloon Region', 'Brussels-Capital Region',
    ],
    Denmark: [
        'Capital Region of Denmark', 'Central Denmark Region',
        'North Denmark Region', 'Region of Southern Denmark', 'Region Zealand',
    ],
    Norway: [
        'Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo',
        'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark',
        'Vestland', 'Viken',
    ],
    Finland: [
        'Uusimaa', 'Southwest Finland', 'Satakunta', 'Kanta-Häme',
        'Pirkanmaa', 'Päijät-Häme', 'Kymenlaakso', 'South Karelia',
        'South Savo', 'North Savo', 'North Karelia', 'Central Finland',
        'South Ostrobothnia', 'Ostrobothnia', 'Central Ostrobothnia',
        'North Ostrobothnia', 'Kainuu', 'Lapland', 'Åland',
    ],
    Greece: [
        'Attica', 'Central Greece', 'Central Macedonia', 'Crete',
        'Eastern Macedonia and Thrace', 'Epirus', 'Ionian Islands',
        'North Aegean', 'Peloponnese', 'South Aegean', 'Thessaly',
        'Western Greece', 'Western Macedonia',
    ],
    Romania: [
        'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud',
        'Botoșani', 'Brașov', 'Brăila', 'Bucharest', 'Buzău', 'Caraș-Severin',
        'Călărași', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj',
        'Galați', 'Giurgiu',
    ],
    Ukraine: [
        'Cherkasy Oblast', 'Chernihiv Oblast', 'Chernivtsi Oblast',
        'Dnipropetrovsk Oblast', 'Donetsk Oblast', 'Ivano-Frankivsk Oblast',
        'Kharkiv Oblast', 'Kherson Oblast', 'Khmelnytskyi Oblast',
        'Kirovohrad Oblast', 'Kyiv Oblast', 'Kyiv City', 'Luhansk Oblast',
        'Lviv Oblast', 'Mykolaiv Oblast', 'Odesa Oblast', 'Poltava Oblast',
        'Rivne Oblast', 'Sumy Oblast', 'Ternopil Oblast',
    ],
    Belarus: [
        'Brest Region', 'Gomel Region', 'Grodno Region', 'Mogilev Region',
        'Minsk Region', 'Minsk City', 'Vitebsk Region',
    ],
    Lithuania: [
        'Alytus County', 'Kaunas County', 'Klaipėda County', 'Marijampolė County',
        'Panevėžys County', 'Šiauliai County', 'Tauragė County', 'Telšiai County',
        'Utena County', 'Vilnius County',
    ],
    Latvia: [
        'Riga', 'Vidzeme', 'Latgale', 'Courland', 'Zemgale',
    ],
    Estonia: [
        'Harju County', 'Hiiu County', 'Ida-Viru County', 'Järva County',
        'Jõgeva County', 'Lääne County', 'Lääne-Viru County', 'Pärnu County',
        'Põlva County', 'Rapla County', 'Saare County', 'Tartu County',
        'Valga County', 'Viljandi County', 'Võru County',
    ],
    Croatia: [
        'Bjelovar-Bilogora', 'Brod-Posavina', 'Dubrovnik-Neretva', 'Istria',
        'Karlovac', 'Koprivnica-Križevci', 'Krapina-Zagorje', 'Lika-Senj',
        'Međimurje', 'Osijek-Baranja', 'Požega-Slavonia', 'Primorje-Gorski Kotar',
        'Šibenik-Knin', 'Sisak-Moslavina', 'Split-Dalmatia', 'Varaždin',
        'Virovitica-Podravina', 'Vukovar-Srijem', 'Zadar', 'Zagreb',
    ],
    'Bosnia and Herzegovina': [
        'Federation of Bosnia and Herzegovina', 'Republika Srpska', 'Brčko District',
    ],
    Serbia: [
        'Vojvodina', 'Belgrade', 'Šumadija and Western Serbia',
        'Southern and Eastern Serbia', 'Kosovo and Metohija',
    ],
    Bulgaria: [
        'Blagoevgrad', 'Burgas', 'Dobrich', 'Gabrovo', 'Haskovo', 'Kardzhali',
        'Kyustendil', 'Lovech', 'Montana', 'Pazardzhik', 'Pernik', 'Pleven',
        'Plovdiv', 'Razgrad', 'Ruse', 'Shumen', 'Silistra', 'Sliven',
        'Smolyan', 'Sofia City',
    ],
    Albania: [
        'Berat', 'Dibër', 'Durrës', 'Elbasan', 'Fier', 'Gjirokastër',
        'Korçë', 'Kukës', 'Lezhë', 'Shkodër', 'Tirana', 'Vlorë',
    ],
    'North Macedonia': [
        'Eastern', 'Northeastern', 'Pelagonia', 'Polog', 'Skopje',
        'Southeastern', 'Southwestern', 'Vardar',
    ],
    Slovenia: [
        'Central Slovenia', 'Coastal-Karst', 'Drava', 'Goriška', 'Littoral-Inner Carniola',
        'Lower Sava', 'Mura', 'Savinja', 'Southeast Slovenia', 'Upper Carniola',
        'Carinthia', 'Central Sava',
    ],
    Slovakia: [
        'Bratislava', 'Trnava', 'Trenčín', 'Nitra', 'Žilina',
        'Banská Bystrica', 'Prešov', 'Košice',
    ],
    Moldova: [
        'Chișinău', 'Bălți', 'Anenii Noi', 'Basarabeasca', 'Briceni',
        'Cahul', 'Călărași', 'Cantemir', 'Căușeni', 'Cimișlia',
        'Criuleni', 'Dondușeni', 'Drochia', 'Dubăsari', 'Edineț',
        'Fălești', 'Florești', 'Glodeni', 'Găgăuzia', 'Hîncești',
    ],
    'Palestine': [
        'West Bank', 'Gaza Strip',
    ],
    'South Sudan': [
        'Central Equatoria', 'Eastern Equatoria', 'Western Equatoria',
        'Jonglei', 'Unity', 'Upper Nile', 'Lakes', 'Warrap',
        'Northern Bahr el Ghazal', 'Western Bahr el Ghazal',
    ],
    Sudan: [
        'Al Jazirah', 'Al Qadarif', 'Blue Nile', 'Central Darfur',
        'East Darfur', 'Kassala', 'Khartoum', 'North Darfur',
        'North Kordofan', 'Northern', 'Red Sea', 'River Nile',
        'Sennar', 'South Darfur', 'South Kordofan', 'West Darfur',
        'West Kordofan', 'White Nile',
    ],
    Zimbabwe: [
        'Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central',
        'Mashonaland East', 'Mashonaland West', 'Masvingo',
        'Matabeleland North', 'Matabeleland South', 'Midlands',
    ],
    Zambia: [
        'Central Province', 'Copperbelt', 'Eastern Province', 'Luapula',
        'Lusaka', 'Muchinga', 'North-Western Province', 'Northern Province',
        'Southern Province', 'Western Province',
    ],
    Uganda: [
        'Central Region', 'Eastern Region', 'Northern Region', 'Western Region',
    ],
    Tanzania: [
        'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera',
        'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara',
        'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North',
        'Pemba South', 'Pwani',
    ],
    Rwanda: [
        'Kigali City', 'Eastern Province', 'Northern Province',
        'Southern Province', 'Western Province',
    ],
    Burundi: [
        'Bubanza', 'Bujumbura Mairie', 'Bujumbura Rural', 'Bururi',
        'Cankuzo', 'Cibitoke', 'Gitega', 'Karuzi', 'Kayanza',
        'Kirundo', 'Makamba', 'Muramvya', 'Muyinga', 'Mwaro',
        'Ngozi', 'Rumonge', 'Rutana', 'Ruyigi',
    ],
    'Sierra Leone': [
        'Eastern Province', 'Northern Province', 'North Western Province',
        'Southern Province', 'Western Area',
    ],
    Liberia: [
        'Bomi', 'Bong', 'Gbarpolu', 'Grand Bassa', 'Grand Cape Mount',
        'Grand Gedeh', 'Grand Kru', 'Lofa', 'Margibi', 'Maryland',
        'Montserrado', 'Nimba', 'River Gee', 'Rivercess', 'Sinoe',
    ],
    'Ivory Coast': [
        'Abidjan', 'Bas-Sassandra', 'Comoé', 'Denguélé', 'Gôh-Djiboua',
        'Lacs', 'Lagunes', 'Montagnes', 'Sassandra-Marahoué',
        'Savanes', 'Vallée du Bandama', 'Woroba', 'Yamoussoukro', 'Zanzan',
    ],
    Senegal: [
        'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou',
        'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou',
        'Tambacounda', 'Thiès', 'Ziguinchor',
    ],
    Mali: [
        'Bamako', 'Kayes', 'Koulikoro', 'Sikasso', 'Ségou', 'Mopti',
        'Tombouctou', 'Gao', 'Kidal', 'Taoudénit', 'Ménaka',
    ],
    'Burkina Faso': [
        'Boucle du Mouhoun', 'Cascades', 'Centre', 'Centre-Est',
        'Centre-Nord', 'Centre-Ouest', 'Centre-Sud', 'Est',
        'Hauts-Bassins', 'Nord', 'Plateau-Central', 'Sahel', 'Sud-Ouest',
    ],
    Niger: [
        'Agadez', 'Diffa', 'Dosso', 'Maradi', 'Niamey', 'Tahoua',
        'Tillabéri', 'Zinder',
    ],
    Chad: [
        'Bahr el Gazel', 'Batha', 'Borkou', 'Chari-Baguirmi', 'Ennedi-Est',
        'Ennedi-Ouest', 'Guéra', 'Hadjer-Lamis', 'Kanem', 'Lac',
        'Logone Occidental', 'Logone Oriental', 'Mandoul', 'Mayo-Kebbi Est',
        'Mayo-Kebbi Ouest', 'Moyen-Chari', 'N\'Djamena', 'Ouaddaï',
        'Salamat', 'Sila',
    ],
    'Central African Republic': [
        'Bangui', 'Bamingui-Bangoran', 'Basse-Kotto', 'Haute-Kotto',
        'Haut-Mbomou', 'Kémo', 'Lobaye', 'Mambéré-Kadéï', 'Mbomou',
        'Nana-Grébizi', 'Nana-Mambéré', 'Ombella-Mpoko', 'Ouaka',
        'Ouham', 'Ouham-Pendé', 'Sangha-Mbaéré', 'Vakaga',
    ],
    Cameroon: [
        'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North',
        'Northwest', 'South', 'Southwest', 'West',
    ],
    'Equatorial Guinea': [
        'Annobón', 'Bioko Norte', 'Bioko Sur', 'Centro Sur',
        'Djibloho', 'Kié-Ntem', 'Litoral', 'Wele-Nzas',
    ],
    Gabon: [
        'Estuaire', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié', 'Nyanga',
        'Ogooué-Ivindo', 'Ogooué-Lolo', 'Ogooué-Maritime', 'Woleu-Ntem',
    ],
    'Congo': [
        'Bouenza', 'Brazzaville', 'Cuvette', 'Cuvette-Ouest',
        'Kouilou', 'Lékoumou', 'Likouala', 'Niari', 'Plateaux',
        'Pointe-Noire', 'Pool', 'Sangha',
    ],
    'Democratic Republic of the Congo': [
        'Bas-Uele', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele',
        'Ituri', 'Kasai', 'Kasai Central', 'Kasai Oriental', 'Kinshasa',
        'Kongo Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba',
        'Mai-Ndombe', 'Maniema', 'Mongala', 'North Kivu', 'South Kivu',
    ],
    Angola: [
        'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
        'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
        'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
        'Namibe', 'Uíge', 'Zaire',
    ],
    Namibia: [
        'Erongo', 'Hardap', 'Karas', 'Kavango East', 'Kavango West',
        'Khomas', 'Kunene', 'Ohangwena', 'Omaheke', 'Omusati',
        'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi',
    ],
    Botswana: [
        'Central', 'Chobe', 'Ghanzi', 'Kgalagadi', 'Kgatleng',
        'Kweneng', 'North East', 'North West', 'South East', 'Southern',
    ],
    Mozambique: [
        'Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo City',
        'Maputo Province', 'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambezia',
    ],
    Madagascar: [
        'Alaotra-Mangoro', 'Amoron\'i Mania', 'Analamanga', 'Analanjirofo',
        'Androy', 'Anosy', 'Atsimo-Andrefana', 'Atsimo-Atsinanana',
        'Atsinanana', 'Betsiboka', 'Boeny', 'Bongolava', 'Diana',
        'Haute Matsiatra', 'Ihorombe', 'Itasy', 'Melaky', 'Menabe',
        'Sava', 'Sofia',
    ],
    Mauritius: [
        'Black River', 'Flacq', 'Grand Port', 'Moka', 'Pamplemousses',
        'Plaines Wilhems', 'Port Louis', 'Rivière du Rempart', 'Savanne',
    ],
    'Seychelles': [
        'Seychelles',
    ],
    'Papua New Guinea': [
        'Central', 'Chimbu', 'Eastern Highlands', 'East New Britain',
        'East Sepik', 'Enga', 'Gulf', 'Hela', 'Jiwaka', 'Madang',
        'Manus', 'Milne Bay', 'Morobe', 'New Ireland', 'Oro',
        'National Capital District', 'Sandaun', 'Southern Highlands',
        'Western', 'Western Highlands',
    ],
    Fiji: [
        'Central Division', 'Eastern Division', 'Northern Division', 'Western Division',
    ],
    'Solomon Islands': [
        'Central', 'Choiseul', 'Guadalcanal', 'Honiara', 'Isabel',
        'Makira-Ulawa', 'Malaita', 'Rennell and Bellona', 'Temotu', 'Western',
    ],
    'Marshall Islands': [
        'Marshall Islands',
    ],
    Palau: [
        'Aimeliik', 'Airai', 'Angaur', 'Hatohobei', 'Kayangel',
        'Koror', 'Melekeok', 'Ngaraard', 'Ngarchelong', 'Ngardmau',
        'Ngatpang', 'Ngchesar', 'Ngeremlengui', 'Ngiwal', 'Peleliu', 'Sonsorol',
    ],
    'North Korea': [
        'Pyongyang', 'Rason', 'Kaesong', 'Nampo',
        'South Pyongan', 'North Pyongan', 'South Hwanghae', 'North Hwanghae',
        'Kangwon', 'South Hamgyong', 'North Hamgyong', 'Ryanggang', 'Chagang',
    ],
    Taiwan: [
        'Taipei City', 'New Taipei City', 'Taoyuan City', 'Taichung City',
        'Tainan City', 'Kaohsiung City', 'Keelung City', 'Hsinchu City',
        'Chiayi City', 'Hsinchu County', 'Miaoli County', 'Changhua County',
        'Nantou County', 'Yunlin County', 'Chiayi County', 'Pingtung County',
        'Yilan County', 'Hualien County', 'Taitung County',
    ],
    'Hong Kong': [
        'Hong Kong',
    ],
    Macau: [
        'Macau',
    ],
    'Vatican City': [
        'Vatican City',
    ],
    'San Marino': [
        'Acquaviva', 'Borgo Maggiore', 'Chiesanuova', 'Domagnano',
        'Faetano', 'Fiorentino', 'Montegiardino', 'San Marino', 'Serravalle',
    ],
    Monaco: [
        'Monaco',
    ],
    Liechtenstein: [
        'Balzers', 'Eschen', 'Gamprin', 'Mauren', 'Planken',
        'Ruggell', 'Schaan', 'Schellenberg', 'Triesen', 'Triesenberg', 'Vaduz',
    ],
    Andorra: [
        'Andorra la Vella', 'Canillo', 'Encamp', 'Escaldes-Engordany',
        'La Massana', 'Ordino', 'Sant Julià de Lòria',
    ],
    Iceland: [
        'Capital Region', 'Eastern Region', 'Northeastern Region',
        'Northwestern Region', 'Southern Peninsula', 'Southern Region',
        'Western Region', 'Westfjords',
    ],
};

export function getDivisionsForCountry(country: string): string[] {
    return DIVISIONS_BY_COUNTRY[country] || [];
}

export function getAllCountries(): readonly string[] {
    return COUNTRIES;
}
