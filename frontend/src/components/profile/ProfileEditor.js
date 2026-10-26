"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { hasRealPhoto } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import ProfileCard from "@/components/ProfileCard";
import PageHeader from "@/components/PageHeader";
import { Spinner } from "@/components/Spinner";
import { CloseIcon, LockIcon, PencilIcon } from "@/components/Icons";

const ABOUT_MIN = 30;
const ABOUT_MAX = 200;
const MAX_SKILLS = 10;

const toForm = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  photoUrl: hasRealPhoto(user) ? user.photoUrl : "",
  age: user?.age ? String(user.age) : "",
  gender: user?.gender || "",
  about: user?.about || "",
  skills: user?.skills || [],
});

export default function ProfileEditor() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(user));
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const addSkill = (raw) => {
    const skill = raw.trim().replace(/,$/, "");
    if (!skill) return;
    if (form.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      return setSkillInput("");
    }
    if (form.skills.length >= MAX_SKILLS) {
      return toast.error(`You can add up to ${MAX_SKILLS} skills.`);
    }
    setForm((f) => ({ ...f, skills: [...f.skills, skill] }));
    setSkillInput("");
  };

  const removeSkill = (skill) => setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));

  const onSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && form.skills.length) {
      removeSkill(form.skills[form.skills.length - 1]);
    }
  };

  // Send only the fields that changed (backend rejects unknown fields, and empty values would fail validation)
  const buildChanges = () => {
    const original = toForm(user);
    const changes = {};
    ["firstName", "lastName", "photoUrl", "gender", "about"].forEach((key) => {
      const value = form[key].trim();
      if (value !== original[key] && value !== "") changes[key] = value;
    });
    if (form.age !== original.age && form.age !== "") changes.age = Number(form.age);
    if (JSON.stringify(form.skills) !== JSON.stringify(original.skills)) changes.skills = form.skills;
    return changes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const about = form.about.trim();
    if (about && (about.length < ABOUT_MIN || about.length > ABOUT_MAX)) {
      return toast.error(`About must be between ${ABOUT_MIN} and ${ABOUT_MAX} characters.`);
    }
    if (form.age && (Number(form.age) < 18 || Number(form.age) > 40)) {
      return toast.error("Age must be between 18 and 40.");
    }

    const changes = buildChanges();
    if (Object.keys(changes).length === 0) {
      return toast.info("Nothing to update.");
    }

    setSaving(true);
    try {
      const { user: updated, message } = await api.updateProfile(changes);
      setUser((current) => ({ ...current, ...updated }));
      toast.success(message || "Profile updated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Live preview uses the form values
  const preview = {
    ...user,
    ...form,
    age: form.age ? Number(form.age) : undefined,
    about: form.about || "Tell other developers about yourself...",
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader title="Your profile" subtitle="This is how other developers see you in their feed." />

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <form onSubmit={handleSubmit} className="card space-y-5 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-crimson-300">
            <PencilIcon className="size-4" /> Edit details
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="label">First name</label>
              <input id="firstName" value={form.firstName} onChange={update("firstName")} className="input" minLength={3} maxLength={50} required />
            </div>
            <div>
              <label htmlFor="lastName" className="label">Last name</label>
              <input id="lastName" value={form.lastName} onChange={update("lastName")} className="input" />
            </div>
          </div>

          <div>
            <label htmlFor="photoUrl" className="label">Photo URL</label>
            <input id="photoUrl" type="url" value={form.photoUrl} onChange={update("photoUrl")} className="input" placeholder="https://..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="age" className="label">Age</label>
              <input id="age" type="number" min={18} max={40} value={form.age} onChange={update("age")} className="input" placeholder="18 - 40" />
            </div>
            <div>
              <label htmlFor="gender" className="label">Gender</label>
              <select id="gender" value={form.gender} onChange={update("gender")} className="input cursor-pointer">
                <option value="" disabled>Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="about" className="label">About</label>
              <span className={`text-xs ${form.about.trim().length > 0 && form.about.trim().length < ABOUT_MIN ? "text-warning" : "text-subtle"}`}>
                {form.about.trim().length}/{ABOUT_MAX}
              </span>
            </div>
            <textarea
              id="about"
              rows={4}
              maxLength={ABOUT_MAX}
              value={form.about}
              onChange={update("about")}
              className="input resize-none"
              placeholder="What do you build? What are you looking for?"
            />
          </div>

          <div>
            <label htmlFor="skills" className="label">Skills <span className="text-subtle">(Enter or comma to add)</span></label>
            <div className="input flex flex-wrap items-center gap-1.5 py-2">
              {form.skills.map((skill) => (
                <span key={skill} className="chip border-crimson-700/60 bg-crimson-800/30">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="cursor-pointer text-crimson-300 hover:text-white" aria-label={`Remove ${skill}`}>
                    <CloseIcon className="size-3" />
                  </button>
                </span>
              ))}
              <input
                id="skills"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={onSkillKeyDown}
                onBlur={() => addSkill(skillInput)}
                className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-subtle"
                placeholder={form.skills.length ? "" : "React, Node.js, MongoDB..."}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-line pt-5">
            <button type="button" onClick={() => setForm(toForm(user))} className="btn btn-ghost">
              Reset
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary px-6">
              {saving && <Spinner className="size-4" />}
              Save changes
            </button>
          </div>
        </form>

        <aside className="space-y-5">
          <div className="lg:sticky lg:top-24">
            <p className="mb-3 text-xs font-semibold tracking-wider text-subtle uppercase">Live preview</p>
            <div className="h-[30rem]">
              <ProfileCard user={preview} />
            </div>

            <div className="card mt-5 flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-800 text-crimson-300">
                <LockIcon className="size-5" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-semibold">Password</p>
                <p className="text-xs text-muted">Reset it with a secure email link.</p>
              </div>
              <Link href="/forgot-password" className="btn btn-secondary px-3 py-2 text-xs">Reset</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
