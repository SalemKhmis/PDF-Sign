// lib/stores/collaboration.js
import { writable, derived } from 'svelte/store';
import * as Y from 'yjs';

function createCollaborationStore() {
    const { subscribe, set, update } = writable({
        users: [],
        changes: [],
        ydoc: null,
        provider: null
    });

    let ydoc = null;
    let provider = null;
    let userName = '';

    return {
        subscribe,
        init: (doc, prov, user) => {
            ydoc = doc;
            provider = prov;
            userName = user;
            set({ users: [], changes: [], ydoc: doc, provider: prov });
        },
        
        registerUser: (name, roomId) => {
            if (provider) {
                provider.awareness.setLocalState({
                    user: {
                        name: name,
                        color: '#' + Math.floor(Math.random()*16777215).toString(16),
                        cursor: null
                    }
                });
            }
        },

        broadcastChange: (change) => {
            update(state => ({
                ...state,
                changes: [...state.changes, { ...change, timestamp: Date.now() }]
            }));
        },

        subscribe: (user, callback) => {
            // Implementation for subscribing to changes
            // This would typically use WebSocket for real-time
        },

        getUserColor: (name) => {
            // Generate consistent color for user
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            return `hsl(${hash % 360}, 70%, 50%)`;
        }
    };
}

export const collaborationStore = createCollaborationStore();