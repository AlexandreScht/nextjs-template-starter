import { useContext } from "react";
import { ServiceEventContext } from "./providers/services";

export function useServiceEvent() {
    const context = useContext(ServiceEventContext);
    if (!context) {
        throw new Error(
            "useServiceEvent must be used within a ServicesProvider",
        );
    }
    return context;
}
