'use client';
// app/components/EventsPageClient.js
// Client component: shows the public events list.
// Organisers/admins can create, edit and delete events.
// Attendees can book events using the Book Now button.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const EMPTY_FORM = {
    title: '',
    description: '',
    event_date: '',
    location: '',
    capacity: '',
};

export default function EventsPageClient({ role }) {
    // Only organisers and admins can create new events
    const canCreate = role === 'organiser' || role === 'admin';
    const router = useRouter();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch all events from the API
    async function loadEvents() {
        setLoading(true);

        try {
            const res = await fetch('/api/events?all=true');
            const data = await res.json();

            setEvents(Array.isArray(data) ? data : []);
        } catch {
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }

    // Load events when the page first opens
    useEffect(() => {
        loadEvents();
    }, []);

    // Update form state when the user types
    function handleChange(e) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }

    // Create a new event
    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    capacity: Number(form.capacity),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create event.');
                return;
            }

            setSuccess(`Event "${form.title}" created successfully.`);
            setForm(EMPTY_FORM);
            loadEvents();
        } catch {
            setError('Network error — please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    // Book an event as an attendee
    async function handleBooking(eventId) {
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: eventId }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Unable to book event.');
                return;
            }

            // Show success message and redirect to My Bookings page
            setSuccess(data.message || 'Event booked successfully. Redirecting to My Bookings...');
            loadEvents();
            
            // Redirect to bookings page after a short delay to show the success message
            setTimeout(() => {
                router.push('/bookings');
            }, 1500);
        } catch {
            setError('Network error — please try again.');
        }
    }

    // Delete an event owned by the organiser or by admin
    async function handleDelete(id) {
        if (!confirm('Delete this event? This cannot be undone.')) return;

        const res = await fetch(`/api/events/${id}`, {
            method: 'DELETE',
        });

        if (res.ok) {
            setSuccess('Event deleted successfully.');
            loadEvents();
        } else {
            const data = await res.json().catch(() => ({}));
            setError(data.error || 'Failed to delete event.');
        }
    }

    return (
        <>
            
            {/* Feedback messages for create, delete and booking actions */}
            {error && (
                <p className="mb-4 text-sm text-red-400 bg-red-900/30 border border-red-600 rounded px-4 py-2">
                    {error}
                </p>
            )}

            {success && (
                <p className="mb-4 text-sm text-green-400 bg-green-900/30 border border-green-600 rounded px-4 py-2">
                    {success}
                </p>
            )}

            {/* Create Event Form — only visible to organisers and admins */}
            {canCreate && (
                <section className="mb-12 rounded border border-white/10 bg-white/5 p-6">
                    <h2 className="text-xl font-bold mb-5 text-[#e10600] uppercase tracking-wider">
                        Create New Event
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Monaco Grand Prix 2026"
                                className="w-full bg-[#1e1e2e] border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e10600]"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                placeholder="Brief description of the event…"
                                className="w-full bg-[#1e1e2e] border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e10600] resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Date *
                            </label>
                            <input
                                type="date"
                                name="event_date"
                                value={form.event_date}
                                onChange={handleChange}
                                required
                                className="w-full bg-[#1e1e2e] border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e10600]"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Capacity *
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={form.capacity}
                                onChange={handleChange}
                                required
                                min={1}
                                placeholder="e.g. 5000"
                                className="w-full bg-[#1e1e2e] border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e10600]"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Circuit de Monaco, Monte Carlo"
                                className="w-full bg-[#1e1e2e] border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#e10600]"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#e10600] text-white px-6 py-2 rounded font-bold uppercase tracking-widest text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Creating…' : 'Create Event'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Events List */}
            {loading ? (
                <p className="text-gray-400">Loading events…</p>
            ) : events.length === 0 ? (
                <p className="text-gray-400">No events scheduled yet.</p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                    {events.map((ev) => (
                        <li
                            key={ev.id}
                            className="rounded border border-white/10 bg-white/5 p-5 flex flex-col gap-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-base leading-snug">
                                    {ev.title}
                                </h3>

                                {ev.can_edit === 1 && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-[#e10600] text-white px-2 py-0.5 rounded shrink-0">
                                        Owner
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-400">
                                📅{' '}
                                {new Date(ev.event_date).toLocaleDateString('en-IE', {
                                    dateStyle: 'medium',
                                })}
                                &nbsp;·&nbsp; 📍 {ev.location}
                                {Number(ev.capacity) - Number(ev.booked_count)} seats remaining
                            </p>

                            <p className="text-xs text-gray-500">
                                Organised by {ev.organiser_name || 'Unknown organiser'}
                            </p>

                            {ev.description && (
                                <p className="text-sm text-gray-300 mt-1 line-clamp-3">
                                    {ev.description}
                                </p>
                            )}

                            {/* Attendees can book events */}
                            {role === 'attendee' && (
                                Number(ev.booked_count) >= Number(ev.capacity) ? (
                                    <button
                                    disabled
                                    className="mt-3 bg-gray-800 text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-xs opacity-70 cursor-not-allowed"
                                    >
                                    Event Full
                                    </button>
                                ) : ev.already_booked ? (
                                    <button
                                    disabled
                                    className="mt-3 bg-gray-600 text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-xs opacity-70 cursor-not-allowed"
                                    >
                                    Already Booked
                                    </button>
                                ) : (
                                    <button
                                    onClick={() => handleBooking(ev.id)}
                                    className="mt-3 bg-[#e10600] text-white px-4 py-2 rounded font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-colors"
                                    >
                                    Book Now
                                    </button>
                                )
                                )}

                            {/* Organiser owner/admin can edit or delete */}
                            {ev.can_edit === 1 && (
                                <div className="flex gap-3 mt-2">
                                    <a
                                        href={`/organiser/events/${ev.id}/edit`}
                                        className="text-xs font-bold text-[#e10600] hover:underline"
                                    >
                                        Edit
                                    </a>

                                    <button
                                        onClick={() => handleDelete(ev.id)}
                                        className="text-xs font-bold text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}