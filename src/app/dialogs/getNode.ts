import { lazy, Fragment } from "react"
import { DIALOG_NAMES } from "@/utils/dialogNames"

const ConfigFormDialog = lazy(() => import("./config/form"))

export function getNode(type: string) {
    let item = Fragment
    switch (type) {
        case DIALOG_NAMES.CONFIG_FORM:
            item = ConfigFormDialog
            break;
    }
    return item
}