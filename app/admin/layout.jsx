import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "ShopMore. - Admin",
    description: "ShopMore. - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
