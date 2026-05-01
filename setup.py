from setuptools import setup, find_packages

setup(
    name="ichis_theme_app",
    version="1.0.0",
    description="GREENFARMS — Central de Identidade Visual e UI Overlay para ERPNext",
    author="GREENFARMS",
    author_email="contato@greenfarms.com.br",
    packages=find_packages(include=["ichis_theme_app", "ichis_theme_app.*"]),
    include_package_data=True,
    zip_safe=False,
)
