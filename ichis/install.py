# Copyright (c) 2026, GREENFARMS
# License: MIT


def after_migrate():
    """Garante que a Page gf-home exista após install/update/migrate."""
    try:
        import frappe
    except Exception:
        return

    try:
        if not frappe.db.exists("Page", "gf-home"):
            page = frappe.get_doc({
                "doctype": "Page",
                "page_name": "gf-home",
                "module": "Ichis Theme App",
                "title": "GF Home",
                "standard": "Yes",
                "roles": []
            })
            page.insert(ignore_permissions=True)
            frappe.db.commit()
    except Exception:
        try:
            frappe.log_error(frappe.get_traceback(), "ICHIS GF Home after_migrate")
        except Exception:
            pass
