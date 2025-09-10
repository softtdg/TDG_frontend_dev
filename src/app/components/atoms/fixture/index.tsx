'use client'
import React, { useEffect } from 'react'
import Table from '../table/index'
import FormButton from '../../form/formbutton'
import { useRouter } from 'next/navigation'

const FixtureData = ({ data, data2, FinalDeliveryDate }: { data: any, data2: any, FinalDeliveryDate?: any }) => {
    // const router = useRouter();
    // useEffect(() => {
    //     const token = localStorage.getItem('accessToken');
    //     if (!token) {
    //         router.push('/');
    //     }
    // }, [router]);
    const Columns = [
        {
            dataField: "assembler",
            text: "Assembler",
            formatter: (_: any, row: any) => {
                return (
                    <div>
                        <span>{row?.assembler?.[0]?.Name}</span>
                    </div>
                )
            }
        },
        {
            dataField: "FixtureNumber",
            text: "Fixture",
            formatter: (_: any, row: any) => {
                return (
                    <div>
                        <FormButton
                            btnName={row?.FixtureNumber}
                            onClick={() => {
                                // Encode productionDateOut to hide it in URL
                                const encodedDate = FinalDeliveryDate ? btoa(FinalDeliveryDate) : '';
                                const url = `/picklist?fixtureNumber=${row?.FixtureNumber}&so=${encodedDate}`;
                                window.open(url, '_blank');
                            }}
                            className='bg-[transparent]'
                        />
                    </div>
                )
            }
        },
        {
            dataField: "fixtureMongoData.Description",
            text: "	Desc",
        },
        {
            dataField: "Quantity",
            text: "Qty",
            formatter: (cell: any) => {
                return (
                    <div className='text-center  text-base font-semibold'>
                        {cell || ""}
                    </div>
                )
            }
        },
        {
            dataField: " TimeToBuildEntries",
            text: "Time To Build/Per Unit",
            formatter: (_: any, row: any) => {
                function convertPerUnitTimeToMinutes(perUnitTime: any) {
                    if (!perUnitTime || perUnitTime === 0) return '0h';

                    const totalMinutes = Math.ceil(perUnitTime * 60);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;

                    let result = '';
                    if (hours > 0) result += `${hours}h${hours > 1 ? '' : ''}`;
                    if (minutes > 0) result += `${hours > 0 ? '' : '0h'}${minutes}m${minutes !== 1 ? '' : ''}`;

                    return result || '0h';
                }
                return (
                    <div>
                        <span>{convertPerUnitTimeToMinutes(row?.Hours)}</span>
                    </div>
                )
            }
        },
        {
            dataField: "TimeToBuildHours",
            text: "Total Time To Build",
            formatter: (_: any, row: any) => {
                function convertDecimalToTime(perUnitTime: any, quantity: any) {
                    const totalHoursDecimal = perUnitTime * quantity;
                    const totalMinutes = Math.floor(totalHoursDecimal * 60);

                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;

                    let result = '';
                    if (hours > 0) result += `${hours}h${hours > 1 ? '' : ''}`;
                    if (minutes > 0) result += `${hours > 0 ? '' : ''}${minutes}m${minutes !== 1 ? '' : ''}`;

                    return result || '0h';
                }
                return (
                    <div>
                        <span>{convertDecimalToTime(row?.Hours, row?.Quantity)}</span>
                    </div>
                )
            }
        },
        {
            dataField: "Amount",
            text: "Amount",
            formatter: (_: any, row: any) => {
                function formatAmount(amount: any) {
                    if (!amount && amount !== 0) return '$0';

                    // Convert to number and format with dollar sign and commas
                    const numAmount = Math.round(parseFloat(amount));
                    if (isNaN(numAmount)) return '$0';

                    return `$${numAmount.toLocaleString()}`;
                }
                return (
                    <div>
                        <span>{formatAmount(row?.Amount)}</span>
                    </div>
                )
            }
        },
        {
            dataField: "",
            text: (
                <div className="flex justify-between text-sm min-w-[700px] outline-none">
                    <span className="w-1/3 p-1.5  border ">Dept</span>
                    <span className="w-1/3 p-1.5 border-t border-b ">Notice</span>
                    <span className="w-1/3 p-1.3 p-1.5  border ">Response</span>
                </div>
            ),
            formatter: (_: any, row: any) => {

                function formatDeptComments(entries: any[]) {
                    const result: any[] = [];

                    if (!Array.isArray(entries)) return result;

                    for (const entry of entries) {
                        const formatDate = (dateStr: any) => {
                            if (!dateStr || dateStr.startsWith("0001")) return null;
                            const date = new Date(dateStr);
                            return `${date.getMonth() + 1}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
                        };

                        // Department Comments
                        if (entry.LeadHandCommentsForPurchasing || entry.PurchasingComments) {
                            const date = formatDate(entry.NotifiedPurchasingDate);
                            result.push({
                                Dept: "Purchasing",
                                Notice: `${date || "N/A"}: ${entry.LeadHandCommentsForPurchasing || ""}`.trim(),
                                Response: entry.PurchasingComments?.trim() || "",
                            });
                        }

                        if (entry.LeadHandCommentsForDesign || entry.DesignComments) {
                            const date = formatDate(entry.NotifiedDesignDate);
                            result.push({
                                Dept: "Design",
                                Notice: `${date || "N/A"}: ${entry.LeadHandCommentsForDesign || ""}`.trim(),
                                Response: entry.DesignComments?.trim() || "",
                            });
                        }

                        if (entry.LeadHandCommentsForSales || entry.SalesComments) {
                            const date = formatDate(entry.NotifiedSalesDate);
                            result.push({
                                Dept: "Sales",
                                Notice: `${date || "N/A"}: ${entry.LeadHandCommentsForSales || ""}`.trim(),
                                Response: entry.SalesComments?.trim() || "",
                            });
                        }

                        // Backorder Entries
                        if (Array.isArray(entry.backorderEntry)) {
                            entry.backorderEntry.forEach((backorder: any) => {
                                const closedDate = formatDate(backorder.ClosedDate);
                                // const notice = closedDate ? `Missing: ${backorder.TDGPN} (${backorder.Quantity?.toFixed(2)}) ${backorder.UOM} - CLOSED - ${closedDate || ""}` : `Missing: ${backorder.TDGPN} (${backorder.Quantity?.toFixed(2)}) ${backorder.UOM}`;
                                const notice = closedDate
                                    ? `Missing: ${backorder.TDGPN} (${backorder.Quantity?.toFixed(2)}) ${backorder.UOM} - CLOSED - ${closedDate}`
                                    : `Missing: ${backorder.TDGPN} (${backorder.Quantity?.toFixed(2)}) ${backorder.UOM}`;
                                const isClosedMissing = !closedDate;
                                result.push({
                                    Dept: "Purchasing",
                                    Notice: notice,
                                    Response: backorder.Response || "",
                                    IsClosedMissing: !closedDate,
                                });
                            });
                        }
                    }

                    return result;
                }

                return (
                    <div className='p-2 w-full h-full'>
                        <div className="">
                            {(() => {
                                return (
                                    <div className='p-2 w-full h-full'>
                                        <div className="">
                                            {(() => {
                                                const deptComments = formatDeptComments(data2?.filter((item: any) => item?.SOPLeadHandEntryId === row?.SOPLeadHandEntryId));

                                                return (
                                                    <table className='border border-collapse text-sm w-full text-left'>
                                                        <tbody>
                                                            {deptComments.length > 0 ?
                                                                (deptComments.map((comment, index) => {
                                                                    const deptColorClass = comment.Dept === "Purchasing" ? "bg-[#607D99]" : comment.Dept === "Design" ? "bg-[#8A9B6B]" : "bg-[#E4E1FF]";
                                                                    return (
                                                                        <tr key={index} className={`${comment.IsClosedMissing
                                                                            ? 'bg-[#99CCFF] text-[#0C2340] font-medium'
                                                                            : deptColorClass
                                                                            }`}>
                                                                            <td className='border px-2 py-1 text-xs'>{comment.Dept}</td>
                                                                            <td className='border px-2 py-1 text-xs'>{comment.Notice}</td>
                                                                            {comment.Response ? <td className='border px-2 py-1 text-xs'>{comment.Response}</td> : <td className='border px-2 py-1 bg-[#913734] w-50 text-xs'>{comment.Response}</td>}
                                                                        </tr>
                                                                    )
                                                                })) : (
                                                                    <tr className="">
                                                                        <td className="border px-2 py-1">&nbsp;</td>
                                                                        <td className="border px-2 py-1">&nbsp;</td>
                                                                        <td className="border px-2 py-1">&nbsp;</td>
                                                                    </tr>
                                                                )}
                                                        </tbody>
                                                    </table>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                )
            }
        },
        {
            dataField: "leadHandEntry.LeadHandComments",
            text: "LH Comments",
            formatter: (_: any, row: any) => (
                <span className="text-sm whitespace-pre-wrap">
                    {data2?.[0]?.LeadHandComments || row?.LeadHandComments}
                </span>
            )
        },

    ]

    if (!Array.isArray(data)) return <div>No fixtures available.</div>;
    return (
        <div>
            <Table columns={Columns} data={data} />
        </div>
    );
}

export default FixtureData