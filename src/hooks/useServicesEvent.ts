import { useContext } from "react";
import { ServiceEventContext } from "../providers/servicesProvider";

export function useServicesEvent() {
    const context = useContext(ServiceEventContext);
    if (!context) {
        throw new Error(
            "useServiceEvent must be used within a ServicesProvider",
        );
    }
    return context;
}
