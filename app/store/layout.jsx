import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "ShopMore. - Store Dashboard",
    description: "ShopMore. - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
