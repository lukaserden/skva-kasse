CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige Log-ID
    timestamp DATETIME DEFAULT (datetime('now')), -- Zeitpunkt des Eintrags
    user_id INTEGER NULL, -- Benutzer, der die Aktion durchgeführt hat
    action TEXT NOT NULL, -- Art der Aktion (z. B. erstellt, geändert, storniert)
    table_name TEXT NOT NULL, -- Betroffene Tabelle
    entry_id INTEGER NOT NULL, -- Geänderte Datensatz-ID
    old_data TEXT NULL, -- JSON mit vorherigen Werten
    new_data TEXT NULL, -- JSON mit neuen Werten
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS service_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige ID der Historie
    member_id INTEGER NOT NULL, -- Welches Mitglied hat teilgenommen?
    service_unit_id INTEGER NOT NULL, -- Welche Serviceeinheit?
    role_id INTEGER NOT NULL, -- Verweis auf `service_roles.id`
    timestamp DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (service_unit_id) REFERENCES service_units(id),
    FOREIGN KEY (role_id) REFERENCES service_roles(id)
);

CREATE TABLE IF NOT EXISTS service_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige ID der Zuweisung
    service_unit_id INTEGER NOT NULL, -- Verweis auf `service_units.id`
    member_id INTEGER NOT NULL, -- Welches Mitglied eingeteilt ist
    role_id INTEGER NOT NULL, -- Verweis auf `service_roles.id`
    state_id INTEGER NOT NULL, -- Verweis auf `service_states.id`
    FOREIGN KEY (service_unit_id) REFERENCES service_units(id),
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (role_id) REFERENCES service_roles(id),
    FOREIGN KEY (state_id) REFERENCES service_states(id)
);

CREATE TABLE IF NOT EXISTS service_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige ID der Rolle
    name TEXT UNIQUE NOT NULL -- Name der Rolle (z. B. Hauptservice, Aushilfe, Dönerhilfe)
);

CREATE TABLE IF NOT EXISTS service_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,	 -- Eindeutige ID des Status
    name TEXT UNIQUE NOT NULL -- Name des Status (z. B. geplant, abgeschlossen, storniert)
);

CREATE TABLE IF NOT EXISTS service_units (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige ID der Serviceeinheit
    start_time DATETIME NOT NULL, -- Startzeit der Einheit
    end_time DATETIME NOT NULL, -- Endzeit der Einheit
    status_id INTEGER NOT NULL, -- Verweis auf `service_statuses.id`
    FOREIGN KEY (status_id) REFERENCES service_statuses(id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige Rollen-ID
    name TEXT UNIQUE NOT NULL -- Rollenname (z. B. Admin, Kassierer, Gast)
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige Benutzer-ID
    member_id INTEGER NOT NULL, -- Zugehörige Mitglieds-ID
    username TEXT UNIQUE NOT NULL, -- Benutzername
    password_hash TEXT NOT NULL, -- Gehashtes Passwort
    role_id INTEGER NOT NULL, -- Verweis auf die Benutzerrolle
    is_active INTEGER DEFAULT 1, -- 1 = aktiv, 0 = deaktiviert
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (role_id) REFERENCES user_roles(id)
);

CREATE TABLE IF NOT EXISTS member_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige ID des Status
    name TEXT UNIQUE NOT NULL -- Name des Status (z. B. aktiv, passiv, Ehrenmitglied, )
);

CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige Mitglieds-ID
    first_name TEXT NOT NULL, -- Vorname
    last_name TEXT NOT NULL, -- Nachname
    birthdate DATETIME NULL, -- Geburtsdatum
    email TEXT NULL, -- E-Mail-Adresse (optional)
    phone TEXT NULL, -- Telefonnummer
    membership_number TEXT UNIQUE NOT NULL, -- Mitgliedsnummer
    member_state_id INTEGER NOT NULL, -- Verweis auf den Mitgliedsstatus
    discount INTEGER DEFAULT 0, -- Rabatt für Mitglieder
    is_active INTEGER DEFAULT 1, -- 1 = aktiv, 0 = deaktiviert
    is_service_required INTEGER DEFAULT 1, -- 1 = dienstpflichtig, 0 = befreit
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (member_state_id) REFERENCES member_states(id)
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige ID der Kategorie
    name TEXT UNIQUE NOT NULL, -- Name der Kategorie
    description TEXT NULL, -- Beschreibung (optional)
    parent_id INTEGER NULL, -- Falls es Unterkategorien gibt
    is_active INTEGER DEFAULT 1, -- 1 = aktiv, 0 = deaktiviert
    created_at DATETIME DEFAULT (datetime('now')), -- Erstellungsdatum
    updated_at DATETIME DEFAULT (datetime('now')), -- Letzte Änderung
    FOREIGN KEY (parent_id) REFERENCES categories(id) -- Selbstreferenz für Unterkategorien
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige Produkt-ID
    name TEXT UNIQUE NOT NULL, -- Produktname
    description TEXT NULL, -- Beschreibung des Produkts
    price INTEGER NOT NULL, -- Preis pro Einheit
    stock INTEGER NULL, -- Verfügbarer Lagerbestand
    unit TEXT NOT NULL, -- Einheit (z. B. Stück, kg, l)
    category_id INTEGER NOT NULL, -- Verweis auf die Hauptkategorie
    is_active INTEGER DEFAULT 1, -- 1 = aktiv, 0 = deaktiviert
    created_at DATETIME DEFAULT (datetime('now')), -- Erstellungszeitpunkt
    updated_at DATETIME DEFAULT (datetime('now')), -- Letzte Aktualisierung
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige ID der Position
    transaction_id INTEGER NOT NULL, -- Zugehörige Transaktions-ID
    product_id INTEGER NOT NULL, -- Gekauftes Produkt
    quantity INTEGER NOT NULL, -- Anzahl der gekauften Einheiten
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'modified', 'canceled', 'confirmed', 'refunded')), -- Status der transaktions_items 
    /* Status
    Bedeutung
    new: Neu hinzugefügt (default bei Bestellung)
    modified: Menge oder Preis wurde angepasst
    canceled: Einzelne Position wurde nachträglich storniert
    confirmed:Fixiert oder final (z.B. nach Ausdruck oder Abrechnung)
    refunded: Zurückgegeben (falls später unterstützt)
    */
    price INTEGER NOT NULL, -- Preis pro Einheit
    subtotal INTEGER GENERATED ALWAYS AS (quantity * price) STORED, -- Automatisch berechnetes Gesamtpreisfeld
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, -- Eindeutige Transaktions-ID
    timestamp DATETIME DEFAULT (datetime('now')), -- Erstellungszeitpunkt
    member_id INTEGER NULL, -- Verknüpftes Mitglied (optional)
    cashier_id INTEGER NOT NULL, -- Benutzer, der die Transaktion durchgeführt hat
    total_amount INTEGER NOT NULL, -- Gesamtbetrag der Transaktion
    payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'card', 'TWINT')), -- Zahlungsmethode
    status TEXT NOT NULL CHECK(status IN ('open', 'paid', 'canceled')), -- Status der Transaktion
    table_number INTEGER NULL, -- Falls das System Tischnummern unterstützt
    total_discount INTEGER NULL, -- Gesamtrabatt auf die Transaktion
    tip INTEGER NULL, -- Gegebenes Trinkgeld
    note TEXT NULL, -- Zusätzliche Anmerkungen
    print_count INTEGER DEFAULT 0, -- Anzahl der gedruckten Belege
    last_printed_at DATETIME NULL, -- Zeitpunkt des letzten Ausdrucks
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (cashier_id) REFERENCES users(id)
);


-- INSERTS


-- 🔹 Rollen für Benutzer (Admin, Kassierer, Mitglied)
INSERT INTO user_roles (name) VALUES 
    ('Admin'), 
    ('Kassierer'), 
    ('Gast');

-- 🔹 Rollen für Service-Rollen (Hauptservice, Aushilfe, Dönerhilfe)
INSERT INTO service_roles (name) VALUES 
    ('Hauptservice'), 
    ('Aushilfe'), 
    ('Dönerhilfe');

-- 🔹 Status für Mitglieder (Aktivmitglied, Passivmitglied, Ehrenmitglied, etc.)
INSERT INTO member_states (name) VALUES 
    ('Aktivmitglied'), 
    ('Passivmitglied'), 
    ('Ehrenmitglied'),
    ('gesperrt'),
	('inaktiv');

-- Hauptkategorien
INSERT INTO categories (name,description) VALUES 
    ('Essen','Alle Speisen und Gerichte, die in der Kasse erfasst werden, von Snacks bis hin zu vollständigen Mahlzeiten'), 
    ('Getränke','Alle alkoholischen und nicht-alkoholischen Getränke, einschliesslich Softdrinks, Wasser, Säfte, Kaffee und Tee.'), 
    ('Diverses','Verschiedene Artikel, die nicht direkt zu Essen oder Getränken gehören, z. B. Bücher, CDs oder sonstige Produkte.');
-- Unterkategorien
INSERT INTO categories (name,description,parent_id) VALUES 
	('Snacks','Kleine Speisen wie Chips, Nüsse, Brezeln, Sandwiches.','1'), 
	('Warme Speisen','Gerichte, die frisch zubereitet oder erwärmt werden, z. B. Döner, Pizza.','1'),
	('Kalte Speisen','Salate, belegte Brötchen, Wraps, Joghurt.','1'),
	('Süsswaren & Desserts','Kuchen, Schokolade, Gebäck, Eis.','1'),
    ('Alkoholfreie Getränke','Wasser, Softdrinks, Säfte, Eistee.','2'), 
    ('Heissgetränke','Kaffee, Tee, heisse Schokolade.','2'),
    ('Bier & Cider','Verschiedene Biersorten und Cider.','2'),
    ('Wein & Sekt','Rotwein, Weisswein, Rosé, Sekt.','2'),
    ('Spirituosen & Cocktails','Hochprozentige Getränke wie Whisky, Vodka, Rum, Gin sowie gemischte Cocktails.','2');

-- Produkte / Artikel: price ist als INT geführt, d.h. ohne Nachkommastellen, damit keine Rundungsfehler entstehen, die Werte müssen durch 100 gerechnet werden um als Dezimalstelle anzuzeigen
INSERT INTO products (name,description,price,unit,category_id) VALUES 
	-- Softgetränke category_id = 8
	('Mineral kl.','kleine Flasche','250','0.5L','8'),
	('Mineral gr.','grosse Flasche','500','1.5L','8'),
	('Ice Tea kl.','Migros Ice-Tea','250','0.5L','8'),
	('Ice Tea gr.','grosse Flasche','500','1.5L','8'),
	('Coca-Cola kl.','Glasflasche','250','0.33L','8'),
	('Coca-Cola gr.','grosse Flasche','500','1.5L','8'),
	('Fanta kl.','Glasflasche','250','0.33L','8'),
	('Fanta gr.','grosse Flasche','500','1.5L','8'),
	('Bitter Lemon','Schweppes','250','0.2L','8'),
	('Indian Tonic','Schweppes','250','0.2L','8'),
	('Rivella','Glasflasche','250','0.33L','8'),
	('Red Bull','Dose','400','0.25L','8'),
	('Crodino','','250','0.175L','8'),
	('San Bitter','','250','0.175L','8'),
	-- Heissgetränke category_id = 9
	('Kaffee','','250','Tasse','9'),
	('Espresso','','250','Tasse','9'),
	('Tee','Schwarz-, Pfefferminz-, Kamillentee','250','Tasse','9'),
	-- Bier category_id = 10
	('Bier kl.','','300','0.33L','10'),
	('Bier gr.','','400','0.5L','10'),
	('Panaché','Dose','400','0.5L','10'),
	-- Wein category_id = 11
	('Wein','Flasche','1500','0.75L','11'),
	-- Alk. Getränke category_id = 12
	('Whisky','Ballantines','500','0.04L','12'),
	('Amaretto','Disaronno','500','0.04L','12'),
	('Grappa','Amarone','500','0.04L','12'),
	('Cocgnac','Vecchia Romagna','500','0.04L','12'),
	('Vodka','weiss, grün, rot','500','0.04L','12'),
	('Raki','Yeni Raki','500','0.04L','12'),
	-- Snacks category_id =4
	('Chips kl.','Zweifel Nature+Paprika','150','30gr','4'),
	('Chips gr.','Zweifel Nature+Paprika','300','90gr','4'),
	('Grissini','','200','60gr','4'),
	('Erdnüsse','','200','100gr','4'),
	('Pop-Corn','','300','100gr','4'),
	-- Warme Speisen category_id =5
	('Döner','','800','1x','5');


    -- Mitglieder
INSERT INTO members (first_name,last_name,birthdate,email,phone,membership_number,member_state_id,discount,is_active,is_service_required) VALUES 
('Sami','Özdemir','1980-01-01','','','M1000','1','','1','1'),
('Daniel','Somlyai','1980-01-01','','','M1001','1','','1','1'),
('Matey','Akkaya','1980-01-01','','','M1002','1','','1','0'),
('Lukas','Erden','1980-01-01','','','M1003','1','','1','1'),
('Saliba','Algul','1980-01-01','','','M1004','1','','1','1'),
('Abraham','Acan','1980-01-01','','','M1005','1','','1','1'),
('Saliba','Eyyi','1980-01-01','','','M1006','1','','1','1'),
('Nebil','Oers','1980-01-01','','','M1007','1','','1','1'),
('Abraham','Gabriel','1980-01-01','','','M1008','1','','1','1'),
('Markus','Gabriel','1980-01-01','','','M1009','1','','1','1'),
('Luca','Özdemir','1980-01-01','','','M1010','1','','1','1'),
('Andreas','Hauenstein','1980-01-01','','','M1011','1','','1','1'),
('Severyos','Oers','1980-01-01','','','M1012','1','','1','1'),
('Gabriel','Bugday','1980-01-01','','','M1013','1','','1','1'),
('Gabriel','Eyyi','1980-01-01','','','M1014','1','','1','1'),
('Gerabet','Özdemir','1980-01-01','','','M1015','1','','1','1'),
('Isa','Özdemir','1980-01-01','','','M1016','1','','1','1'),
('Alexander','Ayik','1980-01-01','','','M1017','1','','1','1'),
('David','Er','1980-01-01','','','M1018','1','','1','1'),
('Elyas','Oers','1980-01-01','','','M1019','1','','1','1'),
('Hanuno','Özaslan','1980-01-01','','','M1020','1','','1','1'),
('George','Safar','1980-01-01','','','M1021','1','','1','1'),
('Tanyeli','Behnan','1980-01-01','','','M1022','2','','1','1'),
('Yakob','Bugday','1980-01-01','','','M1023','1','','1','1'),
('Iskender','Isik','1980-01-01','','','M1024','1','','1','1'),
('Walter','Gamba','1980-01-01','','','M1025','1','','1','1'),
('Yusuf','Algul','1980-01-01','','','M1026','1','','1','1'),
('Severios','Er','1980-01-01','','','M1027','1','','1','1'),
('Süleyman','Bugday','1980-01-01','','','M1028','1','','1','1'),
('Shlemun','Erden','1980-01-01','','','M1029','1','','1','1'),
('Michael','Gehringer','1980-01-01','','','M1030','1','','1','1'),
('Giuseppe','Arik','1980-01-01','','','M1031','1','','1','1'),
('Stefan','Eyyi','1980-01-01','','','M1032','1','','1','1'),
('Matay','Er','1980-01-01','','','M1033','1','','1','1'),
('Kaume','Erden','1980-01-01','','','M1034','1','','1','1'),
('Maravgi','Oers','1980-01-01','','','M1035','1','','1','1'),
('Melek','Es','1980-01-01','','','M1036','1','','1','1'),
('Matthias','Erden','1980-01-01','','','M1037','1','','1','1'),
('Manuel','Oers','1980-01-01','','','M1038','1','','1','1'),
('Thomas','Oers','1980-01-01','','','M1039','1','','1','1'),
('Saliba','Unal','1980-01-01','','','M1040','1','','1','1'),
('Isa','Simon (Türçin)','1980-01-01','','','M1041','2','','1','1'),
('Hanan','Atug','1980-01-01','','','M1042','1','','1','1'),
('Daniel','Oers','1980-01-01','','','M1043','1','','1','1'),
('Ninorta','Oers','1980-01-01','','','M1044','1','','1','1'),
('Lea','Tozman','1980-01-01','','','M1045','1','','1','1'),
('Murat','Tozman','1980-01-01','','','M1046','1','','1','1'),
('Philipp','Tozman','1980-01-01','','','M1047','1','','1','1'),
('Rebecca','Tozman','1980-01-01','','','M1048','1','','1','1'),
('Andreas','Yagiz','1980-01-01','','','M1049','1','','1','1'),
('Semun','Yagiz','1980-01-01','','','M1050','1','','1','1'),
('Johannes','Güzel','1980-01-01','','','M1051','1','','1','1'),
('Johannes','Erden','1980-01-01','','','M1052','1','','1','1'),
('Malek','Bachir','1980-01-01','','','M1053','1','','1','1'),
('Gecer','Christian','1980-01-01','','','M1054','1','','1','1'),
('Semun','Elitok','1980-01-01','','','M1055','1','','1','1'),
('Kerim','Gürkan','1980-01-01','','','M1056','1','','1','1'),
('Markus','Erden','1980-01-01','','','M1057','1','','1','1'),
('Jakob','Oers','1980-01-01','','','M1058','1','','1','1');


    -- TEST DATEN

-- Test Mitglieder
INSERT INTO members (first_name,last_name,birthdate,email,phone,membership_number,member_state_id,discount,is_active,is_service_required) VALUES 
    ('Max','Muster','1990-01-01','','079 123 45 67','1001',1,0,1,1),
    ('Marta','Muster','1995-02-02','','079 234 56 78','1002',1,0,1,1),
    ('Mia','Muster','2000-03-03','','079 345 67 89','1003',1,0,1,1),
    ('Moritz','Muster','2005-04-04','','079 456 78 90','1004',1,0,1,1),
    ('Marius','Muster','2010-05-05','','079 567 89 01','1005',1,0,1,1);

-- Test Benutzer role = 1 (Admin) 2 = Kassierer; is_active = 1 (aktiv)
INSERT INTO users (member_id,username,password_hash,role_id,is_active) VALUES 
    (1,'admin','$2y$10$1,1,1),
    (2,'kassierer','$2y$10$1,2,1);

-- Test Serviceeinheiten
INSERT INTO service_units (start_time,end_time,status_id) VALUES 
    ('2022-01-01 10:00:00','2022-01-04 12:00:00',1),
    ('2022-01-04 12:00:00','2022-01-08 14:00:00',1),
    ('2022-01-08 14:00:00','2022-01-12 16:00:00',1);

-- Test transaktionen
INSERT INTO transactions (cashier_id,total_amount,payment_method,status) VALUES 
    (1,500,'cash','open'),
    (2,1000,'cash','paid'),
    (1,1500,'TWINT','cancelled');

-- Test transaktionspositionen
INSERT INTO transaction_items (transaction_id,product_id,quantity,price) VALUES 
    (1,1,2,250),
    (1,2,1,250),
    (2,3,1,250),
    (2,4,1,500),
    (2,5,1,250),
    (3,6,1,500);

