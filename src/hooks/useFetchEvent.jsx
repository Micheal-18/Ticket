import React from 'react'

export const useFetchEvent = ({events, setEvents}) => {

    const [fetchEvent, setFetchEvent] = React.useState(null);
   // 🔹 Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return fetchEvent;
}
