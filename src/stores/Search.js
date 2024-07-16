import { defineStore } from 'pinia';

export const useSearchStore  = defineStore ('searchStore' , {
    state: () => ({
        status: null,
    })
});

export default useSearchStore;