import db from '../models';

const getSensorDashboard = async (req, res) => {
    try {
        // Lấy danh sách camera, sort theo address rồi id
        const cameras = await db.Camera.findAll({
            order: [
                ['address', 'ASC'],
                ['id', 'ASC'],
            ],
        });

        const CountModel = db.Count || null;

        const result = [];

        for (const camera of cameras) {
            const cameraId = camera.id;

            // Ưu tiên session đang mở
            let session =
                await db.Session.findOne({
                    where: { cameraId, endDate: null },
                    order: [['startDate', 'DESC']],
                });

            // Nếu không có session đang mở thì lấy session mới nhất
            if (!session) {
                session = await db.Session.findOne({
                    where: { cameraId },
                    order: [['startDate', 'DESC']],
                });
            }

            let latestRecord = null;
            let history = [];

            if (session) {
                const sessionId = session.id;

                let latestData = null;
                let historyRows = [];
                let latestCount = null;

                // Luôn lấy latestCount từ DB
                if (CountModel) {
                    latestCount = await CountModel.findOne({
                        where: { sessionId },
                        order: [['createdAt', 'DESC']],
                    });
                }

                // Luôn lấy sensor Data từ DB (nếu có), không phụ thuộc HA
                latestData = await db.Data.findOne({
                    where: { sessionId },
                    order: [['createdAt', 'DESC']],
                });

                // Lịch sử N bản ghi gần nhất (vd 20)
                historyRows = await db.Data.findAll({
                    where: { sessionId },
                    order: [['createdAt', 'DESC']],
                    limit: 20,
                });

                const formatTimestamp = (row) =>
                    row?.atTime || row?.createdAt?.toISOString?.() || row?.createdAt || null;

                // Luôn xây latestRecord, ưu tiên timestamp từ latestData, fallback latestCount
                const ts = latestData ? formatTimestamp(latestData) : (latestCount ? formatTimestamp(latestCount) : null);
                latestRecord = {
                    temperature: latestData ? (latestData.temperature ?? null) : null,
                    humidity: latestData ? (latestData.humidity ?? null) : null,
                    people: latestCount ? latestCount.countPeople : null,
                    vehicle: latestCount ? latestCount.countVehicle : null,
                    timestamp: ts,
                };

                // Lịch sử sensor (nếu có) vẫn giữ như cũ, gắn people/vehicle theo latestCount để tham khảo
                history = (historyRows || []).map((row) => ({
                    timestamp: formatTimestamp(row),
                    temperature: row.temperature ?? null,
                    humidity: row.humidity ?? null,
                    people: latestCount ? latestCount.countPeople : null,
                    vehicle: latestCount ? latestCount.countVehicle : null,
                }));
            }

            result.push({
                cameraId,
                ip: camera.ip,
                port: camera.port,
                address: camera.address,
                latestRecord,
                history,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Sensor dashboard data retrieved successfully',
            data: result,
        });
    } catch (error) {
        console.error('getSensorDashboard error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            errorCode: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
};

module.exports = {
    getSensorDashboard,
};
