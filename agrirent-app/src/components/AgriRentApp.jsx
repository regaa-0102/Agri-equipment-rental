import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleDot,
  CreditCard,
  Filter,
  Heart,
  Leaf,
  LogIn,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sprout,
  Star,
  Tractor,
  Truck,
  UserRound,
  Users,
  Wallet,
  Wheat,
  X,
  Zap,
  Droplets,
  FlaskConical,
  Shovel,
  Bug,
  CircleHelp,
  LayoutDashboard,
  Plus,
  MoreHorizontal,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { categories, listings, popularCategories, productCategories } from "../data/catalog";
import { tamilNaduDistricts } from "../lib/catalog";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { api, getStoredUser } from "../lib/api-client";
import LanguageSelector from "./LanguageSelector";

const iconMap = {
  Tractor,
  Wheat,
  Settings2,
  Droplets,
  Sprout,
  Shovel,
  Leaf,
  Truck,
  FlaskConical,
  Bug,
  CircleDot,
};
const money = (value) => `₹${Number(value).toLocaleString("en-IN")}`;
const read = (key, fallback) => {
  try {
    return typeof window === "undefined"
      ? fallback
      : JSON.parse(window.localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
};

function Icon({ name, size = 18 }) {
  const Component = iconMap[name] || CircleDot;
  return <Component size={size} strokeWidth={1.8} />;
}
function Badge({ children, tone = "green" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
function Button({
  children,
  variant = "primary",
  onClick,
  icon: ButtonIcon,
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      className={`button button-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {ButtonIcon && <ButtonIcon size={16} />}
      {children}
    </button>
  );
}

function Header({ navigate, user, setUser, wishlistCount }) {
  const { t } = useLanguage();
  const { openSettings } = useTheme();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Could not end the authenticated session", error);
    }
  };
  return (
    <header className="topbar">
      <div className="nav-inner">
        <button className="brand" onClick={() => navigate("/")}>
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          <span>
            Agri<span>Rent</span>
          </span>
        </button>
        <nav className={`main-nav ${menu ? "nav-open" : ""}`}>
          <button onClick={() => navigate("/")}>{t("discover")}</button>
          <button onClick={() => navigate("/equipment")}>{t("equipment")}</button>
          <button onClick={() => navigate("/resources")}>{t("products")}</button>
          <button onClick={() => navigate("/how-it-works")}>{t("howItWorks")}</button>
        </nav>
        <div className="nav-actions">
          <LanguageSelector />
          <button
            className="icon-button"
            aria-label="Settings & Theme"
            title="Settings & Themes"
            onClick={openSettings}
          >
            <Settings2 size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="Notifications"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={18} />
            <i />
          </button>
          <button
            className="icon-button wishlist-icon"
            aria-label="Wishlist"
            onClick={() => navigate("/wishlist")}
          >
            <Heart size={18} />
            {wishlistCount > 0 && <em>{wishlistCount}</em>}
          </button>
          {user ? (
            <button className="profile-chip" onClick={() => setOpen(!open)}>
              <span className="avatar">{user.name?.[0] || "A"}</span>
              <span className="profile-name">{user.name}</span>
              <ChevronDown size={14} />
              {open && (
                <span className="profile-menu">
                  <strong>{user.role} account</strong>
                  <button onClick={() => navigate(user.role === "Owner" ? "/owner/dashboard" : user.role === "Admin" ? "/admin/dashboard" : "/farmer/dashboard")}>{t("dashboard")}</button>
                  <button onClick={logout}>{t("signOut")}</button>
                </span>
              )}
            </button>
          ) : (
            <Button variant="dark" icon={LogIn} onClick={() => navigate("/login")}>
              {t("signIn")}
            </Button>
          )}
          <button className="mobile-menu" onClick={() => setMenu(!menu)}>
            {menu ? <X size={22} /> : <MenuIcon size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchBar({ value, setValue, onSearch }) {
  const { t } = useLanguage();
  return (
    <div className="search-box">
      <Search size={20} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        placeholder={t("searchPlaceholder")}
      />
      <button onClick={onSearch}>{t("searchAction")}</button>
    </div>
  );
}

function CategoryCard({ category, onClick }) {
  const { t } = useLanguage();
  return (
    <button className="category-card" onClick={() => onClick(category.name)}>
      <span className="category-icon">
        <Icon name={category.icon} size={22} />
      </span>
      <span>
        <strong>{category.name}</strong>
        <small>{category.count} {t("listingCount")}</small>
      </span>
      <ArrowRight size={16} className="category-arrow" />
    </button>
  );
}

function ListingCard({ item, navigate, wishlist, setWishlist }) {
  const { t } = useLanguage();
  const liked = wishlist.includes(item.id);
  const toggle = () =>
    setWishlist(liked ? wishlist.filter((id) => id !== item.id) : [...wishlist, item.id]);
  return (
    <article className="listing-card">
      <div className="listing-image">
        <img src={item.image} alt={item.name} />
        <button className={`heart-button ${liked ? "liked" : ""}`} onClick={toggle}>
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </button>
        <Badge tone={item.available ? "green" : "gray"}>
          {item.available ? t("availableNow") : t("currentlyBooked")}
        </Badge>
      </div>
      <div className="listing-content">
        <div className="listing-meta">
          <span>{item.category}</span>
          <span>
            <Star size={13} fill="currentColor" /> {item.rating}
          </span>
        </div>
        <h3>{item.name}</h3>
        <p className="location">
          <MapPin size={14} />
          {item.location}
        </p>
        <div className="listing-footer">
          <div>
            <strong>{money(item.price)}</strong>
            <small> / {item.unit}</small>
          </div>
          <button className="text-button" onClick={() => navigate(`/details/${item.id}`)}>
            {t("viewDetails")} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Home({ navigate, search, setSearch, wishlist, setWishlist }) {
  const { t } = useLanguage();
  const [activeKind, setActiveKind] = useState("all");
  const featured = listings
    .filter((item) => activeKind === "all" || item.type === activeKind)
    .slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> {t("heroEyebrow")}
          </div>
          <h1>
            {t("heroTitle")}
          </h1>
          <p>
            {t("heroBody")}
          </p>
          <SearchBar value={search} setValue={setSearch} onSearch={() => navigate("/equipment")} />
          <div className="hero-trust">
            <span>
              <CheckCircle2 size={15} /> Verified owners
            </span>
            <span>
              <ShieldCheck size={15} /> Secure booking
            </span>
            <span>
              <Users size={15} /> 12k+ farmers
            </span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-stat">
            <strong>4.9</strong>
            <span>
              <Star size={13} fill="currentColor" /> average rating
            </span>
          </div>
          <div className="hero-note">
            <span className="avatar avatar-small">KP</span>
            <span>
              <strong>Great experience</strong>
              <small>“Exactly what I needed.”</small>
            </span>
          </div>
        </div>
      </section>
      <main className="content-wrap">
        <section className="section-heading">
          <div>
            <span className="section-kicker">{t("categoriesEyebrow")}</span>
            <h2>{t("categoriesTitle")}</h2>
          </div>
          <button className="link-button" onClick={() => navigate("/equipment")}>
            {t("equipment")} <ArrowRight size={16} />
          </button>
        </section>
        <div className="category-grid">
          {popularCategories.map((category) => (
            <CategoryCard
              key={category.name}
              category={category}
              onClick={(name) => {
                setSearch(name);
                navigate("/equipment");
              }}
            />
          ))}
        </div>
        <section className="resource-category-section">
          <div className="section-heading spaced">
            <div>
              <span className="section-kicker">{t("productsEyebrow")}</span>
              <h2>{t("productsTitle")}</h2>
            </div>
            <button className="link-button" onClick={() => navigate("/resources")}>{t("browseProducts")} <ArrowRight size={16} /></button>
          </div>
          <div className="category-grid">
            {productCategories.map((category) => (
              <CategoryCard key={category.name} category={category} onClick={() => navigate("/resources")} />
            ))}
          </div>
        </section>
        <section className="section-heading spaced">
          <div>
            <span className="section-kicker">{t("popularEyebrow")}</span>
            <h2>{t("popularTitle")}</h2>
          </div>
          <div className="segmented">
            <button
              className={activeKind === "all" ? "active" : ""}
              onClick={() => setActiveKind("all")}
            >
              {t("allListings")}
            </button>
            <button
              className={activeKind === "equipment" ? "active" : ""}
              onClick={() => setActiveKind("equipment")}
            >
              Equipment
            </button>
            <button
              className={activeKind === "resource" ? "active" : ""}
              onClick={() => setActiveKind("resource")}
            >
              Resources
            </button>
          </div>
        </section>
        <div className="listing-grid">
          {featured.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              navigate={navigate}
              wishlist={wishlist}
              setWishlist={setWishlist}
            />
          ))}
        </div>
        <section className="split-feature">
          <div>
            <span className="section-kicker">MADE FOR FARMERS</span>
            <h2>Good tools make good seasons.</h2>
            <p>
              AgriRent brings local farm owners and ambitious farmers together, with transparent
              pricing and support at every step.
            </p>
            <Button onClick={() => navigate("/equipment")} icon={ArrowRight}>
              Start exploring
            </Button>
          </div>
          <div className="feature-points">
            <div>
              <Zap size={20} />
              <span>
                <strong>Flexible rentals</strong>
                <small>Book by the day, week, or season.</small>
              </span>
            </div>
            <div>
              <ShieldCheck size={20} />
              <span>
                <strong>Verified quality</strong>
                <small>Every owner and listing is reviewed.</small>
              </span>
            </div>
            <div>
              <MessageCircle size={20} />
              <span>
                <strong>Local support</strong>
                <small>People who understand your farm.</small>
              </span>
            </div>
          </div>
        </section>
        <section className="steps-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">SIMPLE BY DESIGN</span>
              <h2>From search to harvest</h2>
            </div>
          </div>
          <div className="steps">
            <div>
              <span>01</span>
              <Search size={24} />
              <h3>Find what you need</h3>
              <p>Compare equipment and resources from trusted local owners.</p>
            </div>
            <div>
              <span>02</span>
              <CalendarDays size={24} />
              <h3>Choose your dates</h3>
              <p>Pick a schedule that matches your farm's rhythm.</p>
            </div>
            <div>
              <span>03</span>
              <Sprout size={24} />
              <h3>Grow with confidence</h3>
              <p>Book securely and get back to doing your best work.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function Browse({ navigate, search, setSearch, wishlist, setWishlist, type }) {
  const [category, setCategory] = useState("All categories");
  const [location, setLocation] = useState("All locations");
  const [sort, setSort] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const categoryOptions = categories.filter(
    (item) => item.kind === (type === "resource" ? "resource" : "equipment"),
  );
  const filtered = useMemo(() => {
    let result = listings.filter(
      (item) =>
        (!type || item.type === type) &&
        (category === "All categories" || item.category === category) &&
        (!search ||
          `${item.name} ${item.category} ${item.location}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (location === "All locations" || item.location.includes(location)) &&
        item.price <= maxPrice &&
        (!availableOnly || item.availability),
    );
    if (sort === "Price: low to high") result.sort((a, b) => a.price - b.price);
    if (sort === "Top rated") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [availableOnly, category, location, maxPrice, search, sort, type]);
  return (
    <main className="content-wrap browse-page">
      <div className="breadcrumbs">
        <button onClick={() => navigate("/")}>Home</button>
        <ChevronLeft size={14} />
        <span>{type === "resource" ? "Farming resources" : "Equipment marketplace"}</span>
      </div>
      <div className="browse-head">
        <div>
          <span className="section-kicker">
            {type === "resource" ? "FARM INPUTS" : "FIND YOUR NEXT TOOL"}
          </span>
          <h1>{type === "resource" ? "Farming resources" : "Equipment marketplace"}</h1>
          <p>{filtered.length} listings ready for your next season</p>
        </div>
        <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>
      <div className={`browse-toolbar ${showFilters ? "filters-visible" : ""}`}>
        <div className="mini-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All categories</option>
          {categoryOptions.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option>All locations</option>
          {tamilNaduDistricts.map((district) => (
            <option key={district}>{district}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Recommended</option>
          <option>Price: low to high</option>
          <option>Top rated</option>
        </select>
      </div>
      <div className="browse-layout">
        <aside className="filter-panel">
          <div>
            <strong>Availability</strong>
            <label>
              <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} /> Available now
            </label>
            <label>
              <input type="checkbox" /> Delivery available
            </label>
          </div>
          <div>
            <strong>Price range</strong>
            <div className="price-range">
              <span>₹0</span>
              <span>{maxPrice >= 10000 ? "₹10,000+" : money(maxPrice)}</span>
            </div>
            <input type="range" min="0" max="10000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
          </div>
          <div>
            <strong>Rating</strong>
            <label>
              <input type="checkbox" /> 4.5 & above
            </label>
            <label>
              <input type="checkbox" /> 4.0 & above
            </label>
          </div>
        </aside>
        <div className="browse-results">
          <div className="results-top">
            <span>
              Showing <strong>{filtered.length}</strong> results
            </span>
            <button className="plain-button">
              <Filter size={14} /> Save search
            </button>
          </div>
          <div className="listing-grid">
            {filtered.map((item) => (
              <ListingCard
                key={item.id}
                item={item}
                navigate={navigate}
                wishlist={wishlist}
                setWishlist={setWishlist}
              />
            ))}
          </div>
          {!filtered.length && (
            <div className="empty-state">
              <Search size={32} />
              <h3>No listings found</h3>
              <p>Try changing your filters or search term.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Detail({ id, navigate, wishlist, setWishlist }) {
  const item = listings.find((x) => x.id === id) || listings[0];
  const liked = wishlist.includes(item.id);
  return (
    <main className="content-wrap detail-page">
      <div className="breadcrumbs">
        <button onClick={() => navigate("/equipment")}>Marketplace</button>
        <ChevronLeft size={14} />
        <span>{item.name}</span>
      </div>
      <div className="detail-grid">
        <div className="detail-media">
          <img src={item.image} alt={item.name} />
          <div className="thumb-row">
            <img src={item.image} alt="" />
            <img src={item.image} alt="" />
            <img src={item.image} alt="" />
          </div>
        </div>
        <div className="detail-copy">
          <div className="listing-meta">
            <span>{item.category}</span>
            <span>
              <Star size={13} fill="currentColor" /> {item.rating} ({item.reviews} reviews)
            </span>
          </div>
          <h1>{item.name}</h1>
          <p className="detail-location">
            <MapPin size={16} /> {item.location}
          </p>
          <p className="detail-description">{item.description}</p>
          <div className="owner-line">
            <span className="avatar">{item.owner[0]}</span>
            <span>
              <small>Listed by</small>
              <strong>
                {item.owner} <ShieldCheck size={14} />
              </strong>
            </span>
            <button className="plain-button">
              <MessageCircle size={15} /> Contact
            </button>
          </div>
          <div className="spec-grid">
            {item.specs.map((spec) => (
              <div key={spec}>
                <Check size={15} />
                {spec}
              </div>
            ))}
          </div>
          <div className="detail-price">
            <span>
              <strong>{money(item.price)}</strong> / {item.unit}
            </span>
            <Badge tone={item.available ? "green" : "gray"}>
              {item.available ? "Available now" : "Currently booked"}
            </Badge>
          </div>
          <div className="detail-actions">
            <Button
              onClick={() => item.available && navigate(`/booking/${item.id}`)}
              disabled={!item.available}
              icon={CalendarDays}
            >
              {item.type === "resource" ? "Buy now" : "Book now"}
            </Button>
            <button
              className={`save-button ${liked ? "liked" : ""}`}
              onClick={() =>
                setWishlist(liked ? wishlist.filter((x) => x !== item.id) : [...wishlist, item.id])
              }
            >
              <Heart size={18} fill={liked ? "currentColor" : "none"} /> {liked ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>
      <section className="related-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">YOU MAY ALSO LIKE</span>
            <h2>Similar listings</h2>
          </div>
        </div>
        <div className="listing-grid">
          {listings
            .filter((x) => x.id !== item.id && x.type === item.type)
            .slice(0, 3)
            .map((x) => (
              <ListingCard
                key={x.id}
                item={x}
                navigate={navigate}
                wishlist={wishlist}
                setWishlist={setWishlist}
              />
            ))}
        </div>
      </section>
    </main>
  );
}

function Booking({ itemId, navigate, user, setUser }) {
  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);
  const item = listings.find((x) => x.id === itemId) || listings[0];
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const days =
    start && end ? Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86400000)) : 1;
  const subtotal = item.price * days * quantity;
  const total = subtotal + 99;
  if (!user) return null;
  const confirm = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!start || !end || new Date(end) < new Date(start)) {
      setError("Please choose a valid start and end date.");
      return;
    }
    const booking = {
      id: `AGR-${Date.now().toString().slice(-7)}`,
      itemId: item.id,
      item: item.name,
      amount: total,
      start,
      end,
      quantity,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };
    const bookings = read("agri-bookings", []);
    write("agri-bookings", [booking, ...bookings]);
    navigate(`/payment/${booking.id}`);
  };
  return (
    <main className="content-wrap narrow-page">
      <div className="breadcrumbs">
        <button onClick={() => navigate(`/details/${item.id}`)}>Back to listing</button>
        <ChevronLeft size={14} />
        <span>Booking</span>
      </div>
      <div className="booking-layout">
        <div>
          <span className="section-kicker">RESERVE YOUR RESOURCE</span>
          <h1>Book {item.name}</h1>
          <p className="muted">Choose your dates and review the booking details before payment.</p>
          <div className="booking-form panel">
            <label>
              Start date
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            </label>
            <label>
              End date
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
            </label>
            <label>
              Quantity
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <Button onClick={confirm} icon={ArrowRight}>
              Continue to payment
            </Button>
          </div>
        </div>
        <div className="summary-card">
          <img src={item.image} alt="" />
          <div>
            <strong>{item.name}</strong>
            <span>
              <MapPin size={13} /> {item.location}
            </span>
          </div>
          <hr />
          <div className="summary-row">
            <span>Rental days</span>
            <strong>{days} days</strong>
          </div>
          <div className="summary-row">
            <span>Price / day</span>
            <strong>{money(item.price)}</strong>
          </div>
          <div className="summary-row">
            <span>Quantity</span>
            <strong>{quantity}</strong>
          </div>
          <div className="summary-row">
            <span>Service charge</span>
            <strong>₹99</strong>
          </div>
          <hr />
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}

function Payment({ bookingId, navigate }) {
  const bookings = read("agri-bookings", []);
  const booking = bookings.find((x) => x.id === bookingId) ||
    bookings[0] || { id: bookingId, item: "Your booking", amount: 0 };
  const [method, setMethod] = useState("UPI");
  const [paid, setPaid] = useState(false);
  const pay = () => {
    const payments = read("agri-payments", []);
    write("agri-payments", [
      {
        id: `PAY-${Date.now().toString().slice(-7)}`,
        bookingId: booking.id,
        amount: booking.amount,
        method,
        status: "Paid",
        date: new Date().toISOString(),
      },
      ...payments,
    ]);
    setPaid(true);
  };
  if (paid)
    return (
      <main className="content-wrap centered-page">
        <div className="success-icon">
          <Check size={32} />
        </div>
        <span className="section-kicker">PAYMENT COMPLETE</span>
        <h1>You're all set.</h1>
        <p>
          Your booking <strong>{booking.id}</strong> has been created and the owner will confirm it
          shortly.
        </p>
        <Button onClick={() => navigate("/bookings")} icon={ArrowRight}>
          View my bookings
        </Button>
      </main>
    );
  return (
    <main className="content-wrap narrow-page">
      <div className="breadcrumbs">
        <button onClick={() => navigate(`/booking/${booking.itemId || ""}`)}>Booking</button>
        <ChevronLeft size={14} />
        <span>Payment</span>
      </div>
      <div className="payment-layout">
        <div>
          <span className="section-kicker">SECURE CHECKOUT</span>
          <h1>Complete your payment</h1>
          <div className="payment-methods">
            {["UPI", "Debit card", "Credit card", "Net banking", "Pay later"].map((name) => (
              <button
                key={name}
                className={method === name ? "active" : ""}
                onClick={() => setMethod(name)}
              >
                <CreditCard size={17} />
                {name}
                <span>{method === name && <Check size={15} />}</span>
              </button>
            ))}
          </div>
          <div className="pay-fields panel">
            <label>
              Cardholder name
              <input placeholder="Your full name" />
            </label>
            <label>
              Card or UPI details
              <input placeholder="Enter payment details" />
            </label>
            <Button onClick={pay} icon={Wallet}>
              Pay {money(booking.amount)}
            </Button>
            <small>
              <ShieldCheck size={13} /> This is a simulated payment. No real money is charged.
            </small>
          </div>
        </div>
        <div className="summary-card payment-summary">
          <span className="section-kicker">ORDER SUMMARY</span>
          <div className="summary-row">
            <span>Booking ID</span>
            <strong>{booking.id}</strong>
          </div>
          <div className="summary-row">
            <span>Item</span>
            <strong>{booking.item}</strong>
          </div>
          <hr />
          <div className="summary-total">
            <span>Amount due</span>
            <strong>{money(booking.amount)}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}

function Dashboard({ navigate, user, setUser }) {
  const [tab, setTab] = useState("overview");
  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);
  if (!user) return null;
  const bookings = read("agri-bookings", []);
  const payments = read("agri-payments", []);
  const isOwner = user?.role?.toLowerCase() === "owner";
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const stats = isOwner
    ? [
        ["Total listings", "12", Package],
        ["Pending requests", "4", Bell],
        ["Active rentals", "7", CalendarDays],
        ["Revenue this month", "₹86,400", Wallet],
      ]
    : isAdmin
      ? [
          ["Total users", "12,480", Users],
          ["Farmers", "11,920", Sprout],
          ["Listings", "1,840", Package],
          ["Platform revenue", "₹12.4L", Wallet],
        ]
      : [
          ["Total bookings", String(bookings.length || 8), CalendarDays],
          ["Active rentals", "3", Tractor],
          [
            "Pending bookings",
            String(bookings.filter((x) => x.status === "Pending").length || 2),
            Bell,
          ],
          ["Total spending", "₹42,860", Wallet],
        ];
  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Could not end the authenticated session", error);
    }
  };
  return (
    <main className="dashboard-wrap">
      <aside className="dashboard-side">
        <button className="brand" onClick={() => navigate("/")}>
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          <span>
            Agri<span>Rent</span>
          </span>
        </button>
        <div className="account-label">
          <span className="avatar">{user?.name?.[0] || "A"}</span>
          <span>
            <strong>{user.name}</strong>
            <small>{user.role} account</small>
          </span>
        </div>
        <nav>
          {[
            ["overview", "Dashboard", LayoutDashboard],
            ["bookings", "My bookings", CalendarDays],
            ["browse", "Browse marketplace", Search],
            ["payments", "Payment history", Wallet],
            ["wishlist", "Wishlist", Heart],
            ["notifications", "Notifications", Bell],
            ["profile", "Profile settings", UserRound],
          ].map(([id, label, NavIcon]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => (id === "browse" ? navigate("/equipment") : setTab(id))}
            >
              <NavIcon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <button className="logout-link" onClick={logout}>
          <LogOut size={17} /> Log out
        </button>
      </aside>
      <section className="dashboard-content">
        <div className="dashboard-top">
          <div>
            <span className="section-kicker">
              {isAdmin ? "ADMIN CONSOLE" : isOwner ? "OWNER STUDIO" : "YOUR FARM HQ"}
            </span>
            <h1>
              {tab === "overview"
                ? `Good morning, ${user.name.split(" ")[0]}.`
                : tab[0].toUpperCase() + tab.slice(1)}
            </h1>
          </div>
          <Button variant="soft" onClick={() => navigate("/equipment")} icon={Plus}>
            Browse listings
          </Button>
        </div>
        <div className="stat-grid">
          {stats.map(([label, value, StatIcon]) => (
            <div className="stat-card" key={label}>
              <span className="stat-icon">
                <StatIcon size={19} />
              </span>
              <small>{label}</small>
              <strong>{value}</strong>
              <span className="stat-note">
                <ArrowRight size={12} /> View details
              </span>
            </div>
          ))}
        </div>
        {tab === "overview" && (
          <div className="dashboard-columns">
            <div className="panel recent-panel">
              <div className="panel-heading">
                <h2>Recent bookings</h2>
                <button onClick={() => setTab("bookings")}>
                  View all <ArrowRight size={14} />
                </button>
              </div>
              {(bookings.length
                ? bookings
                : [
                    {
                      id: "AGR-8234102",
                      item: "John Deere 5310 Tractor",
                      amount: 1800,
                      status: "Confirmed",
                      start: "2026-09-14",
                    },
                  ]
              )
                .slice(0, 4)
                .map((booking) => (
                  <div className="booking-row" key={booking.id}>
                    <span className="row-icon">
                      <Tractor size={17} />
                    </span>
                    <span>
                      <strong>{booking.item}</strong>
                      <small>
                        {booking.id} · {booking.start || "Next available"}
                      </small>
                    </span>
                    <strong>{money(booking.amount)}</strong>
                    <Badge tone={booking.status === "Confirmed" ? "green" : "orange"}>
                      {booking.status}
                    </Badge>
                    <MoreHorizontal size={18} />
                  </div>
                ))}
            </div>
            <div className="panel activity-panel">
              <div className="panel-heading">
                <h2>Quick actions</h2>
              </div>
              <button onClick={() => navigate("/equipment")}>
                <Search size={18} />
                <span>
                  <strong>Find equipment</strong>
                  <small>Browse 1,840 verified listings</small>
                </span>
                <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate("/bookings")}>
                <CalendarDays size={18} />
                <span>
                  <strong>Track a booking</strong>
                  <small>See your rental timeline</small>
                </span>
                <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate("/wishlist")}>
                <Heart size={18} />
                <span>
                  <strong>Saved listings</strong>
                  <small>Pick up where you left off</small>
                </span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
        {tab === "bookings" && (
          <div className="panel full-panel">
            <div className="panel-heading">
              <h2>Booking history</h2>
              <Badge tone="green">{bookings.length} total</Badge>
            </div>
            {bookings.length ? (
              bookings.map((item) => (
                <div className="booking-row" key={item.id}>
                  <span className="row-icon">
                    <Package size={17} />
                  </span>
                  <span>
                    <strong>{item.item}</strong>
                    <small>
                      {item.id} · {item.start} to {item.end}
                    </small>
                  </span>
                  <strong>{money(item.amount)}</strong>
                  <Badge tone={item.status === "Confirmed" ? "green" : "orange"}>
                    {item.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <CalendarDays size={30} />
                <h3>Your bookings will appear here</h3>
                <Button onClick={() => navigate("/equipment")}>Browse marketplace</Button>
              </div>
            )}
          </div>
        )}
        {tab === "payments" && (
          <div className="panel full-panel">
            <div className="panel-heading">
              <h2>Payment history</h2>
            </div>
            {payments.length ? (
              payments.map((payment) => (
                <div className="booking-row" key={payment.id}>
                  <span className="row-icon">
                    <CreditCard size={17} />
                  </span>
                  <span>
                    <strong>{payment.id}</strong>
                    <small>
                      {payment.item || "AgriRent booking"} ·{" "}
                      {new Date(payment.date).toLocaleDateString()}
                    </small>
                  </span>
                  <strong>{money(payment.amount)}</strong>
                  <Badge tone="green">{payment.status}</Badge>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Wallet size={30} />
                <h3>No payments yet</h3>
                <p>Completed payments appear here.</p>
              </div>
            )}
          </div>
        )}
        {tab !== "overview" && tab !== "bookings" && tab !== "payments" && (
          <div className="panel full-panel empty-state">
            <CircleHelp size={30} />
            <h3>
              {tab === "profile"
                ? "Profile settings"
                : tab === "wishlist"
                  ? "Your saved listings"
                  : "Nothing new here"}
            </h3>
            <p>This area is ready for your next farm workflow.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function Auth({ navigate, setUser, register = false }) {
  const { t } = useLanguage();
  const [role, setRole] = useState("Farmer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@") || !password) {
      setError(t("validEmail"));
      return;
    }
    if (register && (!name.trim() || !phone.trim() || password !== confirmPassword)) {
      setError(password !== confirmPassword ? "Passwords do not match." : "Full name and phone are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = register
        ? await api.register({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            confirmPassword,
            role: role === "Owner" ? "owner" : "farmer",
          })
        : await api.login(email.trim(), password, role.toLowerCase());
      const account = {
        ...result.user,
        role: result.user.role[0].toUpperCase() + result.user.role.slice(1),
      };
      setUser(account);
      navigate(role === "Owner" ? "/owner/dashboard" : role === "Admin" ? "/admin/dashboard" : "/farmer/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="auth-page">
      <div className="auth-art">
        <button className="brand light-brand" onClick={() => navigate("/")}>
          <span className="brand-mark">
            <Sprout size={20} />
          </span>
          <span>
            Agri<span>Rent</span>
          </span>
        </button>
        <div>
          <span className="section-kicker">{t("marketplaceEyebrow")}</span>
          <h1>
            {t("authHeadline")}
          </h1>
          <p>{t("authDescription")}</p>
        </div>
        <span className="auth-quote">
          “{t("authQuote")}”
        </span>
      </div>
      <div className="auth-form">
        <button className="back-link" onClick={() => navigate("/")}>
          <ChevronLeft size={16} /> Back home
        </button>
        <span className="section-kicker">{register ? t("join") : t("welcome")}</span>
        <h1>{register ? t("join") : t("welcome")}</h1>
        <p>
          {register
            ? t("joinBody")
            : t("signInBody")}
        </p>
        <form onSubmit={submit}>
          {register && (
            <label>
              {t("fullName")}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("yourName")}
              />
            </label>
          )}
          {register && (
            <label>
              Phone
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" required />
            </label>
          )}
          <label>
            {t("email")}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label>
            {t("password")}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={register ? "new-password" : "current-password"}
              required
            />
          </label>
          {register && (
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          )}
          <div className="role-select">
            <span>{t("role")}</span>
            <div>
              {(register ? ["Farmer", "Owner"] : ["Farmer", "Owner", "Admin"]).map((option) => (
                <button
                  type="button"
                  key={option}
                  className={role === option ? "active" : ""}
                  onClick={() => setRole(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" icon={ArrowRight} disabled={loading}>
            {register ? t("createAccount") : t("signIn")}
          </Button>
        </form>
        <p className="auth-switch">
          {register ? t("alreadyAccount") : t("newAccount")}{" "}
          <button onClick={() => navigate(register ? "/login" : "/register")}>
            {register ? t("signIn") : t("register")}
          </button>
        </p>
      </div>
    </main>
  );
}

function Footer({ navigate }) {
  return (
    <footer>
      <div className="footer-inner">
        <div>
          <button className="brand" onClick={() => navigate("/")}>
            <span className="brand-mark">
              <Sprout size={20} />
            </span>
            <span>
              Agri<span>Rent</span>
            </span>
          </button>
          <p>
            Helping India's farmers access
            <br />
            better tools for better seasons.
          </p>
        </div>
        <div>
          <strong>Explore</strong>
          <button onClick={() => navigate("/equipment")}>Equipment</button>
          <button onClick={() => navigate("/resources")}>Farming resources</button>
          <button onClick={() => navigate("/how-it-works")}>How it works</button>
        </div>
        <div>
          <strong>Company</strong>
          <button>About AgriRent</button>
          <button onClick={() => navigate("/contact")}>{t("support")}</button>
          <button>Safety & trust</button>
        </div>
        <div>
          <strong>Language</strong>
          <button>
            English <ChevronDown size={13} />
          </button>
          <small>Made for farmers, with care.</small>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 AgriRent. All rights reserved.</span>
        <span>
          Built for India's farming community <Sprout size={14} />
        </span>
      </div>
    </footer>
  );
}

export default function AgriRentApp() {
  const [path, setPath] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );
  const [user, setUser] = useState(() => getStoredUser());
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState(() => read("agri-wishlist", []));
  useEffect(() => write("agri-wishlist", wishlist), [wishlist]);
  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    window.addEventListener("agrirent_auth_change", syncUser);
    syncUser();
    return () => window.removeEventListener("agrirent_auth_change", syncUser);
  }, []);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const detailMatch = path.match(/^\/details\/(.+)/);
  const bookingMatch = path.match(/^\/booking\/(.+)/);
  const paymentMatch = path.match(/^\/payment\/(.+)/);
  let page;
  if (path === "/login") page = <Auth navigate={navigate} setUser={setUser} />;
  else if (path === "/register") page = <Auth navigate={navigate} setUser={setUser} register />;
  else if (
    path === "/dashboard" ||
    path === "/farmer/dashboard" ||
    path === "/owner/dashboard" ||
    path === "/admin/dashboard" ||
    path === "/farmer-dashboard" ||
    path === "/owner-dashboard" ||
    path === "/admin-dashboard" ||
    path === "/bookings" ||
    path === "/payments" ||
    path === "/wishlist" ||
    path === "/notifications" ||
    path === "/profile"
  )
    page = <Dashboard navigate={navigate} user={user} setUser={setUser} />;
  else if (detailMatch)
    page = (
      <Detail
        id={detailMatch[1]}
        navigate={navigate}
        wishlist={wishlist}
        setWishlist={setWishlist}
      />
    );
  else if (bookingMatch)
    page = <Booking itemId={bookingMatch[1]} navigate={navigate} user={user} setUser={setUser} />;
  else if (paymentMatch) page = <Payment bookingId={paymentMatch[1]} navigate={navigate} />;
  else if (path === "/equipment")
    page = (
      <Browse
        navigate={navigate}
        search={search}
        setSearch={setSearch}
        wishlist={wishlist}
        setWishlist={setWishlist}
        type="equipment"
      />
    );
  else if (path === "/resources" || path === "/products")
    page = (
      <Browse
        navigate={navigate}
        search={search}
        setSearch={setSearch}
        wishlist={wishlist}
        setWishlist={setWishlist}
        type="resource"
      />
    );
  else
    page = (
      <>
        <Home
          navigate={navigate}
          search={search}
          setSearch={setSearch}
          wishlist={wishlist}
          setWishlist={setWishlist}
        />
        <Footer navigate={navigate} />
      </>
    );
  return (
    <div className="app">
      <Header navigate={navigate} user={user} setUser={setUser} wishlistCount={wishlist.length} />
      {page}
    </div>
  );
}
