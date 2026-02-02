export type EventType =
    | 'page_view'
    | 'scroll_depth'
    | 'connect_click'
    | 'project_demo_click'
    | 'visitor_session';

interface AnalyticsEvent {
    event_name: EventType;
    event_data?: any;
    device_type: 'mobile' | 'desktop' | 'tablet';
}

const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Mock storage for demo purposes (would be Supabase in prod)
const getLocalEvents = () => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('analytics_events');
    return stored ? JSON.parse(stored) : [];
};

export const trackEvent = async (event_name: EventType, event_data?: any) => {
    if (typeof window === 'undefined') return;

    const event = {
        event_name,
        event_data,
        device_type: isMobile() ? 'mobile' : 'desktop',
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
    };

    console.log('[Analytics]', event);

    // Store locally for demo dashboard
    const currentEvents = getLocalEvents();
    const updatedEvents = [...currentEvents, event];
    // Limit local storage size
    if (updatedEvents.length > 500) updatedEvents.shift();
    localStorage.setItem('analytics_events', JSON.stringify(updatedEvents));

    // TODO: Replace with Supabase insert
    // supabase.from('analytics_events').insert(event);
};

export const getAnalyticsData = async () => {
    // Return mock/local data
    return getLocalEvents();
}
