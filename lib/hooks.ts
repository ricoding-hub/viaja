"use client";
import { useMemo } from "react";
import { useUI } from "@/store/ui";
import {
  budgetOf,
  isHost,
  itineraryOf,
  membersOf,
  optionsOf,
  peopleById,
  researchOf,
  useData,
  type DataSlice,
} from "./store";

/** All trips for the current user, plus the featured (active) one. */
export function useTrips() {
  const trips = useData((s) => s.trips);
  const people = useData((s) => s.people);
  const options = useData((s) => s.options);
  const research = useData((s) => s.research);
  const itineraryByTrip = useData((s) => s.itineraryByTrip);
  const viewerId = useData((s) => s.viewerId);
  return useMemo(() => {
    const s: DataSlice = { trips, people, options, research, itineraryByTrip, viewerId };
    const featured = trips.find((t) => t.active) || trips[0];
    const homeBudget = featured ? budgetOf(s, featured.id) : null;
    const membersByTrip = (id: string) => membersOf(s, id);
    return { trips, featured, homeBudget, membersByTrip };
  }, [trips, people, options, research, itineraryByTrip, viewerId]);
}

/** Current viewer profile. */
export function useMe() {
  const people = useData((s) => s.people);
  const viewerId = useData((s) => s.viewerId);
  return useMemo(() => people.find((p) => p.id === viewerId) || people[0], [people, viewerId]);
}

/** Everything a trip screen needs (mirrors the prototype `ctx`). */
export function useTrip(tripId: string) {
  const trips = useData((s) => s.trips);
  const people = useData((s) => s.people);
  const options = useData((s) => s.options);
  const research = useData((s) => s.research);
  const itineraryByTrip = useData((s) => s.itineraryByTrip);
  const viewerId = useData((s) => s.viewerId);
  const previewAsGuest = useUI((s) => s.previewAsGuest);

  return useMemo(() => {
    const s: DataSlice = { trips, people, options, research, itineraryByTrip, viewerId };
    const trip = trips.find((t) => t.id === tripId);
    const actualHost = isHost(s, tripId, viewerId);
    return {
      trip,
      members: membersOf(s, tripId),
      options: optionsOf(s, tripId),
      research: researchOf(s, tripId),
      itinerary: itineraryOf(s, tripId),
      budget: budgetOf(s, tripId),
      peopleById: peopleById(s),
      me: people.find((p) => p.id === viewerId),
      viewerId,
      actualHost,
      isHost: actualHost && !previewAsGuest,
      myRole: actualHost ? ("host" as const) : ("guest" as const),
    };
  }, [trips, people, options, research, itineraryByTrip, viewerId, previewAsGuest, tripId]);
}

/** Stable data actions. */
export function useActions() {
  return {
    rate: useData((s) => s.rate),
    toggleWinner: useData((s) => s.toggleWinner),
    addResearch: useData((s) => s.addResearch),
    convertResearch: useData((s) => s.convertResearch),
    createTrip: useData((s) => s.createTrip),
    addGuest: useData((s) => s.addGuest),
    setPeopleCount: useData((s) => s.setPeopleCount),
    toggleConfirm: useData((s) => s.toggleConfirm),
    setCover: useData((s) => s.setCover),
    setOptionCover: useData((s) => s.setOptionCover),
    setViewer: useData((s) => s.setViewer),
  };
}

export function useReady() {
  return useData((s) => s.ready);
}
