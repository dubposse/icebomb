"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORIES } from "@/data/categories";
import { ApiError, createProduct, uploadImage } from "@/lib/api-client";

const reveal = {
  initial: { opacity: 0, height: 0, y: -12 },
  animate: { opacity: 1, height: "auto", y: 0 },
  exit: { opacity: 0, height: 0, y: -12 },
  transition: { type: "spring", stiffness: 300, damping: 30 },
};

export default function AddIceForm() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [shop, setShop] = useState("");
  const [city, setCity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [serverFields, setServerFields] = useState({});
  const [duplicateId, setDuplicateId] = useState(null);

  const isDiele = category === "diele";
  const errors = {
    category: !category && "Bitte eine Kategorie wählen.",
    name: !name.trim() && "Bitte den Namen der Sorte eingeben.",
    brand: category && !isDiele && !brand.trim() && "Bitte Marke / Hersteller eingeben.",
    shop: isDiele && !shop.trim() && "Bitte den Namen des Ladens eingeben.",
    city: isDiele && !city.trim() && "Bitte den Ort eingeben.",
    image: !imageUrl && (imageError || "Bitte ein Produktbild auswählen."),
  };
  const show = (key) => (submitted && errors[key] ? errors[key] : serverFields[key] ?? null);

  function onFile(e) {
    const file = e.target.files?.[0];
    setImageError("");
    setFile(null);
    if (!file) return setImageUrl("");
    if (!file.type.startsWith("image/")) {
      setImageUrl("");
      return setImageError("Das ist keine Bilddatei.");
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(String(reader.result));
      setFile(file);
    };
    reader.readAsDataURL(file);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    setServerError("");
    setServerFields({});
    setDuplicateId(null);
    if (Object.values(errors).some(Boolean) || !file || busy) return;
    setBusy(true);
    try {
      const { imageKey } = await uploadImage(file);
      const base = { category, name: name.trim(), image_key: imageKey };
      const created = await createProduct(
        isDiele
          ? { ...base, shop_name: shop.trim(), city: city.trim() }
          : { ...base, brand: brand.trim() },
      );
      router.push(`/eis/${created.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.data.existingId) {
        setServerError("Dieses Eis gibt es schon. ");
        setDuplicateId(err.data.existingId);
      } else {
        setServerError(err.message || "Speichern fehlgeschlagen.");
      }
      if (err instanceof ApiError && err.data.fields) setServerFields(err.data.fields);
      setBusy(false);
    }
  }

  const error = (key, id = `${key}-err`) => (
    <AnimatePresence initial={false}>
      {show(key) && (
        <motion.p
          key={key}
          className="error"
          id={id}
          initial={{ opacity: 0, x: -14 }}
          animate={{ opacity: 1, x: [-14, 8, -4, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {show(key)}
        </motion.p>
      )}
    </AnimatePresence>
  );

  const field = (key, label, value, setter, props = {}) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <input
        id={key}
        value={value}
        onChange={(e) => setter(e.target.value)}
        aria-invalid={Boolean(show(key))}
        aria-describedby={show(key) ? `${key}-err` : undefined}
        required
        {...props}
      />
      {error(key)}
    </div>
  );

  return (
    <form className="form" onSubmit={onSubmit} noValidate data-cat={category || undefined}>
      <p className="notice" role="note">
        Neue Eissorten sind öffentlich sichtbar. Das Bild wird beim Speichern hochgeladen (JPG, PNG oder WebP, max. 5 MB).
      </p>

      <fieldset className="field">
        <legend>Kategorie</legend>
        <div className="cat-pick">
          {CATEGORIES.map((c) => (
            <motion.label
              key={c.id}
              className="cat-pick__item"
              data-cat={c.id}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -3 }}
            >
              <input
                type="radio"
                name="category"
                value={c.id}
                checked={category === c.id}
                onChange={() => setCategory(c.id)}
                required
              />
              {category === c.id && (
                <motion.span
                  layoutId="cat-active"
                  className="cat-pick__bg"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="cat-pick__label">{c.label}</span>
            </motion.label>
          ))}
        </div>
        {error("category")}
      </fieldset>

      {field("name", "Name der Eissorte", name, setName, { autoComplete: "off" })}

      <AnimatePresence initial={false} mode="popLayout">
        {category && !isDiele && (
          <motion.div key="brand" className="reveal" {...reveal}>
            {field("brand", "Marke / Hersteller", brand, setBrand)}
          </motion.div>
        )}
        {isDiele && (
          <motion.div key="diele" className="reveal reveal--stack" {...reveal}>
            {field("shop", "Name des Ladens", shop, setShop)}
            {field("city", "Ort", city, setCity)}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="field">
        <label htmlFor="image">Produktbild</label>
        <div className={`drop${imageUrl ? " drop--filled" : ""}`}>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFile}
            aria-invalid={Boolean(show("image"))}
            aria-describedby={show("image") ? "image-err" : undefined}
          />
          <p className="drop__hint" aria-hidden="true">
            {imageUrl ? "Anderes Bild wählen" : "Bild hierher ziehen oder tippen"}
          </p>
          <AnimatePresence>
            {imageUrl && (
              <motion.div
                className="preview"
                initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Vorschau des gewählten Produktbilds" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {error("image", "image-err")}
      </div>

      {serverError && (
        <p className="error form-error" role="alert">
          {serverError}
          {duplicateId && <Link href={`/eis/${duplicateId}`}>Zum bestehenden Eis</Link>}
        </p>
      )}
      <button type="submit" className="btn btn--ink btn--big" disabled={busy}>
        {busy ? "Wird gespeichert …" : "Eis hinzufügen"}
      </button>
    </form>
  );
}
